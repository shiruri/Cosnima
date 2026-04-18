-- =============================================
-- COSNIMA PostgreSQL Schema (exact replica of MySQL)
-- =============================================
-- All IDs are VARCHAR(36) to match MySQL CHAR(36)
-- Run: psql -d cosnima_db -f schemaPostgreSQL.sql
-- =============================================

-- =============================================
-- USERS (CHAR(36))
-- =============================================
CREATE TABLE users (
    id            VARCHAR(36) PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio           TEXT,
    avatar_url    VARCHAR(500),
    avatar_public_id VARCHAR(200),
    role          VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    is_banned    BOOLEAN NOT NULL DEFAULT FALSE,
    ban_reason   TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CONVENTIONS (CHAR(36))
-- =============================================
CREATE TABLE conventions (
    id             VARCHAR(36) PRIMARY KEY,
    name           VARCHAR(200) NOT NULL,
    location       VARCHAR(300),
    event_date     DATE NOT NULL,
    event_end_date DATE,
    description    TEXT,
    website_url    VARCHAR(500),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- LISTINGS (CHAR(36))
-- =============================================
CREATE TABLE listings (
    id                VARCHAR(36) PRIMARY KEY,
    seller_id         VARCHAR(36) NOT NULL,
    title             VARCHAR(200) NOT NULL,
    description      TEXT,
    price            DECIMAL(10,2) NOT NULL,
    price_note       VARCHAR(100),
    price_days       INTEGER,
    type             VARCHAR(10) NOT NULL,
    condition        VARCHAR(20),
    size             VARCHAR(50),
    character_name   VARCHAR(100),
    series_name      VARCHAR(100),
    location        VARCHAR(200),
    convention_pickup BOOLEAN NOT NULL DEFAULT FALSE,
    convention_id   VARCHAR(36),
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    view_count      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at     TIMESTAMP,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (convention_id) REFERENCES conventions(id)
);

-- =============================================
-- LISTING IMAGES (BIGINT - matches entity Long ID)
-- =============================================
CREATE TABLE listing_images (
    id          BIGSERIAL PRIMARY KEY,
    listing_id  VARCHAR(36) NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    public_id  VARCHAR(200),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- =============================================
-- TAGS (BIGINT - matches entity Long)
-- =============================================
CREATE TABLE tags (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE listing_tags (
    listing_id VARCHAR(36) NOT NULL,
    tag_id     BIGINT NOT NULL,
    PRIMARY KEY (listing_id, tag_id),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- =============================================
-- WISHLISTS (CHAR(36))
-- =============================================
CREATE TABLE wishlists (
    user_id    VARCHAR(36) NOT NULL,
    listing_id VARCHAR(36) NOT NULL,
    saved_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, listing_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- =============================================
-- OFFERS (CHAR(36))
-- =============================================
CREATE TABLE offers (
    id            VARCHAR(36) PRIMARY KEY,
    listing_id    VARCHAR(36) NOT NULL,
    buyer_id      VARCHAR(36) NOT NULL,
    offered_price DECIMAL(10,2) NOT NULL,
    message      TEXT,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- =============================================
-- RENTALS (CHAR(36))
-- =============================================
-- RENTALS (BIGINT - matches entity Long ID)
-- =============================================
CREATE TABLE rentals (
    id           BIGSERIAL PRIMARY KEY,
    listing_id   VARCHAR(36) NOT NULL,
    renter_id  VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    total_price DECIMAL(10,2),
    deposit    DECIMAL(10,2),
    status     VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (renter_id) REFERENCES users(id)
);

-- =============================================
-- CONVERSATIONS (CHAR(36))
-- =============================================
CREATE TABLE conversations (
    id          VARCHAR(36) PRIMARY KEY,
    listing_id  VARCHAR(36) NOT NULL,
    buyer_id   VARCHAR(36) NOT NULL,
    seller_id  VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (listing_id, buyer_id),
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE messages (
    id               VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    sender_id        VARCHAR(36) NOT NULL,
    content          TEXT NOT NULL,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- =============================================
-- RATINGS (BIGINT - matches entity Long ID)
-- =============================================
CREATE TABLE ratings (
    id                BIGSERIAL PRIMARY KEY,
    rater_id         VARCHAR(36) NOT NULL,
    rated_user_id    VARCHAR(36) NOT NULL,
    transaction_type VARCHAR(20),
    transaction_id   BIGINT NOT NULL,
    stars           SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment         TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (rater_id, transaction_type, transaction_id),
    FOREIGN KEY (rater_id) REFERENCES users(id),
    FOREIGN KEY (rated_user_id) REFERENCES users(id)
);

-- =============================================
-- REPORTS (CHAR(36))
-- =============================================
CREATE TABLE reports (
    id           VARCHAR(36) PRIMARY KEY,
    reporter_id  VARCHAR(36) NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id   VARCHAR(36) NOT NULL,
    reason     VARCHAR(20) NOT NULL,
    description TEXT,
    status     VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    reviewed_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    UNIQUE (reporter_id, target_type, target_id),
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- =============================================
-- LISTING VIEWS (CHAR(36))
-- =============================================
CREATE TABLE listing_views (
    listing_id VARCHAR(36) NOT NULL,
    user_id    VARCHAR(36) NOT NULL,
    viewed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (listing_id, user_id),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- INDEXES (same as MySQL)
-- =============================================
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_series ON listings(series_name);
CREATE INDEX idx_listings_character ON listings(character_name);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_rentals_listing ON rentals(listing_id);
CREATE INDEX idx_messages_convo ON messages(conversation_id, sent_at);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_listing_tags ON listing_tags(listing_id);

-- =============================================
-- FUNCTIONS & TRIGGERS (for updated_at)
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();