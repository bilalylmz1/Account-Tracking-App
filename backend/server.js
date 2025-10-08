/**
 * @fileoverview Main server application for Account Tracking System
 * @description Express.js server with RESTful API endpoints for account management
 * @version 1.0.0
 * @author Account Tracking App Team
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

/**
 * Database connection configuration
 */
const db = require('./src/config/db');

/**
 * Application routes imports
 */
const groupRoutes = require('./src/routes/groupRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const userSettingsRoutes = require('./src/routes/userSettingsRoutes');

/**
 * Express application instance
 */
const app = express();

/**
 * Middleware Configuration
 */
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ==============================================
 * API Routes Registration
 * ==============================================
 */

/**
 * Account group management endpoints
 * @route /api/groups
 */
app.use('/api/groups', groupRoutes);

/**
 * Customer account management endpoints  
 * @route /api/accounts
 */
app.use('/api/accounts', accountRoutes);

/**
 * Financial transaction management endpoints
 * @route /api/transactions
 */
app.use('/api/transactions', transactionRoutes);

/**
 * User settings management endpoints
 * @route /api/settings
 */
app.use('/api/settings', userSettingsRoutes);

/**
 * ==============================================
 * Main Routes & Documentation Endpoints
 * ==============================================
 */

/**
 * Root endpoint - API documentation and health check
 * @route GET /
 * @returns {object} API information and available endpoints
 */
app.get('/', (req, res) => {
    res.json({ 
        message: 'Cari Takip App Backend API',
        version: '1.0.0',
        status: 'Çalışıyor',
        endpoints: {
            health: '/api/health',
            groups: '/api/groups',
            accounts: '/api/accounts',
            transactions: '/api/transactions',
            settings: '/api/settings'
        },
        documentation: {
            groups: {
                'GET /api/groups': 'Tüm grupları listele',
                'POST /api/groups': 'Yeni grup oluştur',
                'GET /api/groups/:id': 'Tekil grup getir',
                'PUT /api/groups/:id': 'Grup güncelle',
                'DELETE /api/groups/:id': 'Grup sil',
                'GET /api/groups/:id/accounts/count': 'Gruba bağlı hesap sayısı'
            },
            accounts: {
                'GET /api/accounts': 'Tüm cari hesapları listele',
                'POST /api/accounts': 'Yeni cari hesap oluştur',
                'GET /api/accounts/:id': 'Tekil cari hesap getir',
                'PUT /api/accounts/:id': 'Cari hesap güncelle',
                'DELETE /api/accounts/:id': 'Cari hesap sil',
                'GET /api/accounts/type/:type': 'Türe göre cari hesapları getir',
                'GET /api/accounts/group/:groupId': 'Gruba göre cari hesapları getir',
                'GET /api/accounts/search?q=term': 'Cari hesap ara'
            },
            transactions: {
                'GET /api/transactions': 'Tüm işlemleri listele',
                'POST /api/transactions': 'Yeni işlem oluştur',
                'GET /api/transactions/:id': 'Tekil işlem getir',
                'PUT /api/transactions/:id': 'İşlem güncelle',
                'DELETE /api/transactions/:id': 'İşlem sil',
                'GET /api/transactions/filter': 'Filtrelenmiş işlemler',
                'GET /api/transactions/summary': 'İşlem özeti',
                'GET /api/transactions/account/:accountId': 'Cari hesaba ait işlemler'
            },
            settings: {
                'GET /api/settings': 'Tüm ayarları listele',
                'GET /api/settings/:settingName': 'Tekil ayar getir',
                'PUT /api/settings/:settingName': 'Ayar güncelle/oluştur',
                'DELETE /api/settings/:settingName': 'Ayar sil',
                'POST /api/settings/initialize': 'Varsayılan ayarları oluştur',
                'POST /api/settings/bulk': 'Çoklu ayar güncelle',
                'GET /api/settings/category/:category': 'Kategoriye göre ayarları getir'
            }
        }
    });
});

// Veritabanı bağlantı testi endpoint'i
app.get('/api/health', async (req, res) => {
    try {
        const connection = await db.getConnection();
        connection.release();
        res.json({ 
            status: 'success',
            message: 'Veritabanı bağlantısı başarılı',
            database: process.env.DB_NAME,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Veritabanı bağlantı hatası',
            error: error.message
        });
    }
});

/**
 * 404 Not Found handler
 * @route * (catch-all)
 */
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Endpoint bulunamadı',
        path: req.originalUrl
    });
});

/**
 * Global error handler middleware
 * @param {Error} error - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        message: 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bir hata oluştu'
    });
});

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log('');
    console.log('📋 Kullanılabilir API Endpoint\'leri:');
    console.log(`   🏠 Ana sayfa: http://localhost:${PORT}/`);
    console.log(`   ❤️  Health: http://localhost:${PORT}/api/health`);
    console.log(`   📁 Gruplar: http://localhost:${PORT}/api/groups`);
    console.log(`   👤 Cari Hesaplar: http://localhost:${PORT}/api/accounts`);
    console.log(`   💰 İşlemler: http://localhost:${PORT}/api/transactions`);
    console.log(`   ⚙️  Ayarlar: http://localhost:${PORT}/api/settings`);
    console.log('');
    console.log('📖 Detaylı API dokümantasyonu için: http://localhost:' + PORT + '/');
});