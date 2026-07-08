<div align="center">

# 🌸 Cosnima

**A full-stack cosplay & anime community platform**
built with Spring Boot 4 · Java 21 · JWT Auth

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.5-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-supported-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MySQL](https://img.shields.io/badge/MySQL-9.6-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-pink?style=flat)](LICENSE)

[GitHub →](https://github.com/shiruri/Cosnima) · [Report Bug](https://github.com/shiruri/Cosnima/issues) · [Request Feature](https://github.com/shiruri/Cosnima/issues)

</div>

---

## 📖 About

Cosnima is a full-stack web platform for the cosplay and anime community. It provides a space for fans to share costumes, interact in real time, and discover community content — backed by a robust Java-based REST API with secure authentication and live messaging support.

---

## ✨ Features

- 🔐 **JWT Authentication** — Stateless, secure login and registration via JSON Web Tokens
- 🛡️ **Spring Security** — Role-based access control and endpoint protection
- 💬 **Real-time WebSocket Chat** — Live messaging powered by Spring WebSocket (STOMP)
- 🖼️ **Cloudinary Integration** — Cloud image uploads for cosplay photos and avatars
- 🗄️ **Dual Database Support** — Compatible with both PostgreSQL and MySQL
- ✅ **Bean Validation** — Request body validation with Spring Validation
- 📊 **Actuator Monitoring** — Built-in health checks and app metrics
- 🌐 **RESTful API** — Clean MVC architecture via Spring Web MVC

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.0.5 |
| Security | Spring Security + JJWT 0.11.5 |
| Database | PostgreSQL / MySQL 9.6 |
| ORM | Spring Data JPA (Hibernate) |
| Media | Cloudinary HTTP 1.31.0 |
| Build | Apache Maven (mvnw) |
| Frontend | HTML · CSS · JavaScript |
| Monitoring | Spring Boot Actuator |

---

## 📁 Project Structure

```
Cosnima/
├── src/
│   ├── main/
│   │   ├── java/com/shiro/cosnime/
│   │   │   ├── config/        # Security, WebSocket, CORS config
│   │   │   ├── controller/    # REST API controllers
│   │   │   ├── model/         # JPA entities
│   │   │   ├── repository/    # Spring Data repositories
│   │   │   ├── service/       # Business logic
│   │   │   └── util/          # JWT utilities, helpers
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/        # HTML, CSS, JS frontend
│   └── test/
├── .mvn/wrapper/
├── pom.xml
└── mvnw / mvnw.cmd
```

---

## ⚙️ Prerequisites

Before you begin, make sure you have:

- **Java 21** or higher — [Download JDK](https://adoptium.net/)
- **Maven 3.9+** (or use the included `mvnw` wrapper)
- **PostgreSQL** or **MySQL** database instance
- **Cloudinary account** — [Sign up free](https://cloudinary.com/)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shiruri/Cosnima.git
cd Cosnima
```

### 2. Configure application properties

Edit `src/main/resources/application.properties`:

```properties
# Database (PostgreSQL example)
spring.datasource.url=jdbc:postgresql://localhost:5432/cosnima
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

# MySQL alternative
# spring.datasource.url=jdbc:mysql://localhost:3306/cosnima
# spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JWT
jwt.secret=your_jwt_secret_key_here
jwt.expiration=86400000

# Cloudinary
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

### 3. Run the application

**Using the Maven wrapper (recommended):**

```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

**Or build a JAR and run it:**

```bash
./mvnw clean package -DskipTests
java -jar target/cosnime-0.0.1-SNAPSHOT.jar
```

The server will start at **http://localhost:8080**

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/posts` | Get all community posts |
| POST | `/api/posts` | Create a new post (auth required) |
| POST | `/api/upload` | Upload image to Cloudinary |
| WS | `/ws` | WebSocket connection endpoint |

> All protected endpoints require `Authorization: Bearer <token>` header.

---

## 🌐 WebSocket Usage

Connect to the WebSocket endpoint using a STOMP client:

```javascript
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
  // Subscribe to a topic
  stompClient.subscribe('/topic/messages', (msg) => {
    console.log(JSON.parse(msg.body));
  });

  // Send a message
  stompClient.send('/app/chat', {}, JSON.stringify({ content: 'Hello!' }));
});
```

---

## 🧪 Running Tests

```bash
./mvnw test
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to your branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/shiruri">shiruri</a>
</div>
