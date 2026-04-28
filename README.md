# 🎓 Student Automation System

## 📌 Proje Açıklaması
**Student Automation System**, öğrenci, öğretmen ve ders yönetimini kolaylaştırmak için geliştirilmiş bir full-stack web uygulamasıdır.  

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

Swagger: [https://localhost:5025/swagger](http://localhost:5025/swagger/index.html)


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

Login Page
<img width="778" height="660" alt="Ekran görüntüsü 2026-04-28 174642" src="https://github.com/user-attachments/assets/1dbab443-585d-45ce-8b54-1771babda717" />

Student Page
<img width="1901" height="899" alt="Ekran görüntüsü 2026-04-28 174905" src="https://github.com/user-attachments/assets/3ecd057c-b984-4a7e-8356-0163439b520c" />

Teacher Pages
<img width="1131" height="599" alt="Ekran görüntüsü 2026-04-28 174810" src="https://github.com/user-attachments/assets/6d0b3fce-9ba7-44b5-8736-41de25c2fbd5" />
<img width="1893" height="884" alt="Ekran görüntüsü 2026-04-28 174821" src="https://github.com/user-attachments/assets/2d36d1f0-402c-43cb-9e0d-a7914c2207f6" />
<img width="1900" height="887" alt="Ekran görüntüsü 2026-04-28 174832" src="https://github.com/user-attachments/assets/1e1db4a4-7de8-449c-a44c-f90167015fd0" />


