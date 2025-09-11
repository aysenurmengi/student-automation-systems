# 🎓 Student Automation System

## 📌 Proje Açıklaması
**Student Automation System**, öğrenci, öğretmen ve ders yönetimini kolaylaştırmak için geliştirilmiş bir tam-stack web uygulamasıdır.  

- **Backend**: ASP.NET Core 9 + Entity Framework Core + PostgreSQL  
- **Frontend**: React + Ant Design  
- **Authentication**: ASP.NET Identity + Cookie Authentication  
- **Veritabanı**: PostgreSQL  

Sistem, **Admin, Teacher ve Student** rollerini destekler.  

---

## ⚙️ Kurulum ve Çalıştırma Adımları  

### 1️⃣ Gereksinimler
- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)  
- [Node.js](https://nodejs.org/) (>=18)  
- [PostgreSQL](https://www.postgresql.org/download/)  

---

### 2️⃣ Veritabanı Kurulumu
PostgreSQL üzerinde yeni bir veritabanı oluşturun:  
  ```sql 
  CREATE DATABASE StudentAutomationDb;
```
appsettings.json içine connection string ekle:
```sql
   "ConnectionStrings": {"DefaultConnection": "Host=localhost;Port=5432;
Database=StudentAutomationDb;Username=postgres;Password=senin_sifren"}
   ```
Migration çalıştır:

cd backend/StudentAutomation.Api

dotnet ef database update

3️⃣ Backend (API) Çalıştırma

cd backend/StudentAutomation.Api

dotnet run

Swagger: https://localhost:5025/swagger


4️⃣ Frontend (React) Çalıştırma
cd frontend/student-ui

npm install

npm run dev

Uygulama: http://localhost:5173



## Test Kullanıcı Bilgileri
👨‍💼 Admin

User Name: admin

Password: Admin456.

👩‍🏫 Teacher

First Name: Test

Last Name: Teacher

Password: Testteacher1.

🎓 Student

Student No: 12345678

Password: Teststudent1.

#### Admin hesabı ile giriş yaptıktan sonra yeni öğretmen/öğrenci ekleyebilirsiniz.

## Proje Dizini
```sql
student-automation/
│
├── backend/
│   └── StudentAutomation.Api/      # ASP.NET Core Backend
│       ├── Controllers/            # API Controller'ları
│       ├── Domain/                 # Entity sınıfları
│       ├── Data/                   # DbContext
│       └── Program.cs
│
├── frontend/
│   └── student-ui/                 # React Frontend
│       ├── src/
│       │   ├── api/                # Axios servisleri
│       │   ├── auth/               # AuthContext, ProtectedRoute
│       │   ├── pages/              # Login, Dashboard
│       │   └── components/         # Layout, UI
│       └── vite.config.js
│
└── README.md
```


Uygulama: http://localhost:5173

### 🎁 Bonus Görevler
+ Swagger Entegrasyonu
+ Responsive frontend tasarımı (Ant Design ile)
