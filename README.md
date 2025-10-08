# Account Tracking App (Cari Takip Uygulaması)

Modern, kullanıcı dostu cari hesap takip ve yönetim uygulaması.

## 🚀 Özellikler

### Backend API
- **RESTful API**: Express.js ile geliştirilmiş profesyonel API
- **Veritabanı**: MySQL ile güçlü veri yönetimi
- **CRUD İşlemleri**: Tüm varlıklar için tam CRUD desteği
- **Güvenlik**: SQL injection koruması ve input validation
- **Performans**: Connection pooling ve optimize edilmiş sorgular

### Ana Modüller
1. **Grup Yönetimi** - Cari hesap grupları oluşturma ve düzenleme
2. **Hesap Yönetimi** - Müşteri/Tedarikçi hesapları yönetimi
3. **Hareket Yönetimi** - Finansal işlemler ve bakiye takibi
4. **Ayarlar** - Kullanıcı tercihleri ve uygulama ayarları

## 📋 Gereksinimler

- Node.js 16.x veya üzeri
- MySQL 8.0 veya üzeri
- npm veya yarn

## ⚡ Kurulum

### Backend Kurulumu

1. Repository'yi klonlayın:
```bash
git clone https://github.com/bilalylmz1/Account-Tracking-App.git
cd Account-Tracking-App
```

2. Backend bağımlılıklarını yükleyin:
```bash
cd backend
npm install
```

3. Çevre değişkenlerini yapılandırın:
```bash
# .env dosyası oluşturun ve aşağıdaki bilgileri ekleyin
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cari_takip_app
DB_PORT=3306
PORT=3001
FRONTEND_URL=http://localhost:3000
```

4. Sunucuyu başlatın:
```bash
npm start
```

## 📊 API Endpoints

### Grup Yönetimi (`/api/groups`)
- `GET /api/groups` - Tüm grupları listele
- `POST /api/groups` - Yeni grup oluştur
- `GET /api/groups/:id` - Grup detayları
- `PUT /api/groups/:id` - Grup güncelle
- `DELETE /api/groups/:id` - Grup sil

### Hesap Yönetimi (`/api/accounts`)
- `GET /api/accounts` - Tüm hesapları listele
- `POST /api/accounts` - Yeni hesap oluştur
- `GET /api/accounts/:id` - Hesap detayları
- `PUT /api/accounts/:id` - Hesap güncelle
- `DELETE /api/accounts/:id` - Hesap sil

### Hareket Yönetimi (`/api/transactions`)
- `GET /api/transactions` - Tüm hareketleri listele
- `POST /api/transactions` - Yeni hareket ekle
- `GET /api/transactions/:id` - Hareket detayları
- `PUT /api/transactions/:id` - Hareket güncelle
- `DELETE /api/transactions/:id` - Hareket sil

### Kullanıcı Ayarları (`/api/settings`)
- `GET /api/settings` - Tüm ayarları getir
- `GET /api/settings/:name` - Belirli ayar getir
- `PUT /api/settings/:name` - Ayar güncelle
- `POST /api/settings/bulk` - Toplu ayar güncelleme

## 🛠 Teknoloji Stack

### Backend
- **Framework**: Express.js 4.18.2
- **Database**: MySQL2 3.6.5
- **Middleware**: CORS 2.8.5
- **Environment**: dotenv 16.3.1

### Geliştirme Araçları
- **Runtime**: Node.js
- **Package Manager**: npm
- **Version Control**: Git

## 📁 Proje Yapısı

```
cari-takip-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── groupModel.js
│   │   │   ├── accountModel.js
│   │   │   ├── transactionModel.js
│   │   │   └── userSettingsModel.js
│   │   ├── controllers/
│   │   │   ├── groupController.js
│   │   │   ├── accountController.js
│   │   │   ├── transactionController.js
│   │   │   └── userSettingsController.js
│   │   └── routes/
│   │       ├── groupRoutes.js
│   │       ├── accountRoutes.js
│   │       ├── transactionRoutes.js
│   │       └── userSettingsRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/ (Yakında gelecek)
└── README.md
```

## 🎯 Kullanım

1. **Sunucu Başlatma**: `npm start` ile backend sunucusunu başlatın
2. **API Test**: `http://localhost:3001` adresinden API dokümantasyonuna erişin
3. **Health Check**: `http://localhost:3001/api/health` ile sistem durumunu kontrol edin

## 🔧 Geliştirme

### Code Style
- JSDoc dokümantasyonu kullanılmıştır
- Professional comment standards uygulanmıştır
- MVC pattern takip edilmektedir

### Database Schema
- `account_groups`: Hesap grupları
- `accounts`: Cari hesaplar
- `transactions`: Finansal hareketler
- `user_settings`: Kullanıcı ayarları

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📞 İletişim

- **Geliştirici**: Bilal Yılmaz
- **GitHub**: [@bilalylmz1](https://github.com/bilalylmz1)
- **Proje Repository**: [Account-Tracking-App](https://github.com/bilalylmz1/Account-Tracking-App)

## 🚧 Roadmap

- [x] Backend API Development
- [x] Database Models & Controllers
- [x] RESTful Endpoints
- [ ] Frontend React Application
- [ ] User Authentication
- [ ] Advanced Reporting
- [ ] Mobile Application