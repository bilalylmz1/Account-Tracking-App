/**
 * @fileoverview Account Routes
 * @description RESTful API routes for customer account management operations
 * @version 1.0.0
 */

const express = require('express');
const accountController = require('../controllers/accountController');

/**
 * Express Router instance for account routes
 */
const router = express.Router();

/**
 * ==============================================
 * Customer Account Management API Routes
 * ==============================================
 * Bu dosya cari hesaplarının CRUD işlemleri
 * için gerekli API endpoint'lerini tanımlar.
 */

// ==============================================
// CARI HESAPLAR İLE İLGİLİ ANA ROUTE'LAR
// ==============================================

/**
 * @route   GET /api/accounts
 * @desc    Tüm cari hesapları listele (grup adlarıyla birlikte)
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @returns {Array} Cari hesap listesi (alfabetik sıralı)
 * @example
 * Response:
 * {
 *   "success": true,
 *   "message": "Cari hesaplar başarıyla getirildi",
 *   "data": [
 *     {
 *       "id": 1,
 *       "account_name": "Ahmet Yılmaz",
 *       "account_code": "AH001",
 *       "group_id": 1,
 *       "group_name": "Müşteriler",
 *       "phone": "+90 555 123 45 67",
 *       "email": "ahmet@example.com",
 *       "balance": 1500.50,
 *       "account_type": "customer",
 *       "is_active": 1,
 *       "created_at": "2024-01-01T12:00:00.000Z"
 *     }
 *   ],
 *   "count": 1
 * }
 */
router.get('/', accountController.getAllAccounts);

/**
 * @route   POST /api/accounts
 * @desc    Yeni cari hesap oluştur
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @body    {ad_soyad: string, account_code?: string, group_id?: number, phone?: string, email?: string, address?: string, tax_number?: string, tax_office?: string, balance?: number, account_type?: string}
 * @returns {Object} Oluşturulan cari hesap bilgisi
 * @example
 * Request Body:
 * {
 *   "ad_soyad": "Mehmet Kaya",
 *   "account_code": "MK002",
 *   "group_id": 1,
 *   "phone": "+90 555 987 65 43",
 *   "email": "mehmet@example.com",
 *   "address": "İstanbul, Türkiye",
 *   "tax_number": "12345678901",
 *   "tax_office": "Kadıköy Vergi Dairesi",
 *   "balance": 0,
 *   "account_type": "customer"
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Cari hesap başarıyla oluşturuldu",
 *   "data": {
 *     "id": 2,
 *     "account_name": "Mehmet Kaya",
 *     "account_code": "MK002",
 *     "message": "Cari hesap başarıyla oluşturuldu"
 *   }
 * }
 */
router.post('/', accountController.createAccount);

// ==============================================
// TEK CARİ HESAP İLE İLGİLİ ROUTE'LAR (:id parametreli)
// ==============================================

/**
 * @route   GET /api/accounts/:id
 * @desc    Belirli bir cari hesabı ID ile getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Cari hesap ID'si (zorunlu, pozitif sayı)
 * @returns {Object} Cari hesap detay bilgisi
 * @example
 * GET /api/accounts/1
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Cari hesap başarıyla getirildi",
 *   "data": {
 *     "id": 1,
 *     "account_name": "Ahmet Yılmaz",
 *     "account_code": "AH001",
 *     "group_id": 1,
 *     "group_name": "Müşteriler",
 *     "phone": "+90 555 123 45 67",
 *     "email": "ahmet@example.com",
 *     "address": "Ankara, Türkiye",
 *     "tax_number": "98765432109",
 *     "tax_office": "Çankaya Vergi Dairesi",
 *     "balance": 1500.50,
 *     "account_type": "customer",
 *     "is_active": 1,
 *     "created_at": "2024-01-01T12:00:00.000Z",
 *     "updated_at": "2024-01-01T12:00:00.000Z"
 *   }
 * }
 */
router.get('/:id', accountController.getAccountById);

/**
 * @route   PUT /api/accounts/:id
 * @desc    Mevcut cari hesabı güncelle
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Güncellenecek cari hesap ID'si (zorunlu, pozitif sayı)
 * @body    {ad_soyad: string, account_code?: string, group_id?: number, phone?: string, email?: string, address?: string, tax_number?: string, tax_office?: string, balance?: number, account_type?: string}
 * @returns {Object} Güncellenmiş cari hesap bilgisi
 * @example
 * PUT /api/accounts/1
 * Request Body:
 * {
 *   "ad_soyad": "Ahmet Yılmaz (Güncellendi)",
 *   "account_code": "AH001",
 *   "group_id": 2,
 *   "phone": "+90 555 111 22 33",
 *   "email": "ahmet.new@example.com",
 *   "balance": 2000.75,
 *   "account_type": "both"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Cari hesap başarıyla güncellendi",
 *   "data": {
 *     "id": 1,
 *     "account_name": "Ahmet Yılmaz (Güncellendi)",
 *     "account_code": "AH001",
 *     "message": "Cari hesap başarıyla güncellendi"
 *   }
 * }
 */
router.put('/:id', accountController.updateAccount);

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Mevcut cari hesabı sil (soft delete)
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Silinecek cari hesap ID'si (zorunlu, pozitif sayı)
 * @returns {Object} Silme işlemi sonucu
 * @note    Eğer cari hesaba bağlı işlemler varsa silme işlemi başarısız olur
 * @example
 * DELETE /api/accounts/1
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Cari hesap başarıyla silindi",
 *   "data": {
 *     "message": "Cari hesap başarıyla silindi"
 *   }
 * }
 * 
 * Error Response (400 Bad Request):
 * {
 *   "success": false,
 *   "message": "Cari hesap silinemedi",
 *   "error": "Bu cari hesaba bağlı 10 işlem bulunduğu için silinemez"
 * }
 */
router.delete('/:id', accountController.deleteAccount);

// ==============================================
// FİLTRELEME VE ARAMA ROUTE'LARI
// ==============================================

/**
 * @route   GET /api/accounts/type/:type
 * @desc    Hesap türüne göre cari hesapları getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {string} type - Hesap türü (customer, supplier, both)
 * @returns {Array} Belirtilen türdeki cari hesaplar
 * @example
 * GET /api/accounts/type/customer
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "customer türündeki cari hesaplar başarıyla getirildi",
 *   "data": [...],
 *   "count": 15
 * }
 */
router.get('/type/:type', accountController.getAccountsByType);

/**
 * @route   GET /api/accounts/group/:groupId
 * @desc    Gruba göre cari hesapları getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} groupId - Grup ID'si (zorunlu, pozitif sayı)
 * @returns {Array} Belirtilen gruba ait cari hesaplar
 * @example
 * GET /api/accounts/group/1
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Gruba ait cari hesaplar başarıyla getirildi",
 *   "data": [...],
 *   "count": 8
 * }
 */
router.get('/group/:groupId', accountController.getAccountsByGroup);

/**
 * @route   GET /api/accounts/search
 * @desc    Cari hesap arama (ad, kod, telefon, email'de arama yapar)
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @query   {string} q - Arama terimi (zorunlu, min 2 karakter)
 * @returns {Array} Arama sonuçları
 * @example
 * GET /api/accounts/search?q=ahmet
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "\"ahmet\" için arama sonuçları",
 *   "data": [...],
 *   "count": 3,
 *   "searchTerm": "ahmet"
 * }
 */
router.get('/search', accountController.searchAccounts);

/**
 * ==============================================
 * HATA DURUMLARI VE HTTP STATUS KODLARI
 * ==============================================
 * 
 * 200 OK          - Başarılı GET, PUT, DELETE işlemleri
 * 201 Created     - Başarılı POST işlemleri (yeni cari hesap oluşturma)
 * 400 Bad Request - Validation hataları, duplicate cari adı/kodu, bağlı işlemler varken silme
 * 404 Not Found   - Cari hesap bulunamadığında
 * 500 Internal Server Error - Sunucu tarafı hatalar
 * 
 * ==============================================
 * ÖRNEK VALIDATION HATALARI
 * ==============================================
 * 
 * - Boş ad soyad: "Ad soyad alanı gereklidir"
 * - Çok kısa ad soyad: "Ad soyad en az 2 karakter olmalıdır"
 * - Çok uzun ad soyad: "Ad soyad en fazla 255 karakter olabilir"
 * - Geçersiz ID: "ID sayısal bir değer olmalıdır"
 * - Duplicate cari adı: "Bu cari hesap adı zaten mevcut"
 * - Duplicate cari kodu: "Bu cari kodu zaten kullanılıyor"
 * - Geçersiz grup: "Belirtilen grup bulunamadı"
 * - Geçersiz email: "Geçersiz email formatı"
 * - Geçersiz hesap türü: "Hesap türü customer, supplier veya both olmalıdır"
 * - Geçersiz bakiye: "Bakiye sayısal bir değer olmalıdır"
 * 
 * ==============================================
 * ZORUNLU ALANLAR
 * ==============================================
 * 
 * - ad_soyad (string): Cari hesap adı - zorunlu
 * 
 * ==============================================
 * OPSİYONEL ALANLAR
 * ==============================================
 * 
 * - account_code (string): Cari kodu (benzersiz olmalı)
 * - group_id (number): Grup ID'si
 * - phone (string): Telefon numarası
 * - email (string): Email adresi
 * - address (string): Adres bilgisi
 * - tax_number (string): Vergi numarası
 * - tax_office (string): Vergi dairesi
 * - balance (number): Bakiye (varsayılan: 0)
 * - account_type (string): Hesap türü (customer/supplier/both, varsayılan: customer)
 * 
 * ==============================================
 * HESAP TÜRLERİ
 * ==============================================
 * 
 * - customer: Müşteri hesabı
 * - supplier: Tedarikçi hesabı
 * - both: Hem müşteri hem tedarikçi
 */

// Router'ı dışa aktar
module.exports = router;