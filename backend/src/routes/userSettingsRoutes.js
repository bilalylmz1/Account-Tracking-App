/**
 * @fileoverview User Settings Routes
 * @description RESTful API routes for user settings and preferences management
 * @version 1.0.0
 */

const express = require('express');
const userSettingsController = require('../controllers/userSettingsController');

/**
 * Express Router instance for user settings routes
 */
const router = express.Router();

/**
 * ==============================================
 * User Settings Management API Routes
 * ==============================================
 * Bu dosya uygulama ayarlarının CRUD işlemleri
 * için gerekli API endpoint'lerini tanımlar.
 */

// ==============================================
// ÖZEL YARDIMCI VE YÖNETİM ROUTE'LARI (Öncelik sırası önemli)
// ==============================================

/**
 * @route   POST /api/settings/initialize
 * @desc    Varsayılan ayarları oluştur
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @returns {Object} Oluşturulan ayar sayısı ve detayları
 * @example
 * POST /api/settings/initialize
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "9 varsayılan ayar oluşturuldu/güncellendi",
 *   "data": {
 *     "message": "9 varsayılan ayar oluşturuldu/güncellendi",
 *     "createdCount": 9,
 *     "totalSettings": 9
 *   }
 * }
 */
router.post('/initialize', userSettingsController.initializeDefaultSettings);

/**
 * @route   POST /api/settings/bulk
 * @desc    Çoklu ayar güncelleme (maksimum 50 ayar)
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @body    {settings: Array} - Ayar listesi
 * @returns {Object} Toplu işlem sonucu
 * @example
 * Request Body:
 * {
 *   "settings": [
 *     {
 *       "setting_name": "currency",
 *       "setting_value": "EUR",
 *       "setting_type": "string",
 *       "description": "Ana para birimi"
 *     },
 *     {
 *       "setting_name": "decimal_places",
 *       "setting_value": 3,
 *       "setting_type": "number"
 *     }
 *   ]
 * }
 * 
 * Response (200 OK / 207 Multi-Status):
 * {
 *   "success": true,
 *   "message": "2 ayar başarıyla güncellendi, 0 ayar başarısız",
 *   "data": {
 *     "total": 2,
 *     "success": 2,
 *     "failed": 0,
 *     "results": [...]
 *   }
 * }
 */
router.post('/bulk', userSettingsController.setBulkSettings);

/**
 * @route   GET /api/settings/category/:category
 * @desc    Kategoriye göre ayarları getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {string} category - Kategori adı (ayar adının başlangıç kısmı)
 * @returns {Array} Kategoriye ait ayar listesi
 * @example
 * GET /api/settings/category/theme
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "theme kategorisindeki ayarlar başarıyla getirildi",
 *   "data": [
 *     {
 *       "setting_name": "theme_settings",
 *       "setting_value": {
 *         "theme": "light",
 *         "primaryColor": "#2563eb"
 *       },
 *       "setting_type": "json",
 *       "description": "Tema ayarları",
 *       "updated_at": "2024-10-08T10:00:00.000Z"
 *     }
 *   ],
 *   "count": 1,
 *   "category": "theme"
 * }
 */
router.get('/category/:category', userSettingsController.getSettingsByCategory);

// ==============================================
// ANA AYAR YÖNETİMİ ROUTE'LARI
// ==============================================

/**
 * @route   GET /api/settings
 * @desc    Tüm ayarları listele
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @returns {Array} Ayar listesi (alfabetik sıralı)
 * @example
 * Response:
 * {
 *   "success": true,
 *   "message": "Ayarlar başarıyla getirildi",
 *   "data": [
 *     {
 *       "setting_name": "app_name",
 *       "setting_value": "Cari Takip Uygulaması",
 *       "setting_type": "string",
 *       "description": "Uygulama adı",
 *       "created_at": "2024-10-08T10:00:00.000Z",
 *       "updated_at": "2024-10-08T10:00:00.000Z"
 *     },
 *     {
 *       "setting_name": "currency",
 *       "setting_value": "TRY",
 *       "setting_type": "string",
 *       "description": "Ana para birimi",
 *       "created_at": "2024-10-08T10:00:00.000Z",
 *       "updated_at": "2024-10-08T10:00:00.000Z"
 *     }
 *   ],
 *   "count": 2
 * }
 */
router.get('/', userSettingsController.getAllSettings);

// ==============================================
// TEKİL AYAR YÖNETİMİ ROUTE'LARI (:settingName parametreli)
// ==============================================

/**
 * @route   GET /api/settings/:settingName
 * @desc    Belirli bir ayarı getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {string} settingName - Ayar adı (zorunlu, max 100 karakter)
 * @returns {Object} Ayar detay bilgisi
 * @example
 * GET /api/settings/currency
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Ayar başarıyla getirildi",
 *   "data": {
 *     "setting_name": "currency",
 *     "setting_value": "TRY",
 *     "setting_type": "string",
 *     "description": "Ana para birimi",
 *     "updated_at": "2024-10-08T10:00:00.000Z"
 *   }
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "success": false,
 *   "message": "Ayar bulunamadı",
 *   "error": "Ayar bulunamadı"
 * }
 */
router.get('/:settingName', userSettingsController.getSetting);

/**
 * @route   PUT /api/settings/:settingName
 * @desc    Mevcut ayarı güncelle veya yeni ayar oluştur
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {string} settingName - Güncellenecek/oluşturulacak ayar adı (zorunlu, max 100 karakter)
 * @body    {setting_value: any, setting_type?: string, description?: string}
 * @returns {Object} Güncellenmiş/oluşturulmuş ayar bilgisi
 * @example
 * PUT /api/settings/currency
 * Request Body:
 * {
 *   "setting_value": "USD",
 *   "setting_type": "string",
 *   "description": "Ana para birimi (güncellendi)"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Ayar başarıyla güncellendi",
 *   "data": {
 *     "setting_name": "currency",
 *     "setting_value": "USD",
 *     "setting_type": "string",
 *     "description": "Ana para birimi (güncellendi)",
 *     "message": "Ayar başarıyla güncellendi"
 *   }
 * }
 * 
 * PUT /api/settings/decimal_places (Number örneği)
 * Request Body:
 * {
 *   "setting_value": 3,
 *   "setting_type": "number",
 *   "description": "Ondalık basamak sayısı"
 * }
 * 
 * PUT /api/settings/auto_backup (Boolean örneği)
 * Request Body:
 * {
 *   "setting_value": false,
 *   "setting_type": "boolean"
 * }
 * 
 * PUT /api/settings/theme_config (JSON örneği)
 * Request Body:
 * {
 *   "setting_value": {
 *     "theme": "dark",
 *     "primaryColor": "#1f2937",
 *     "fontSize": "large"
 *   },
 *   "setting_type": "json",
 *   "description": "Tema konfigürasyonu"
 * }
 */
router.put('/:settingName', userSettingsController.setSetting);

/**
 * @route   DELETE /api/settings/:settingName
 * @desc    Mevcut ayarı sil
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {string} settingName - Silinecek ayar adı (zorunlu)
 * @returns {Object} Silme işlemi sonucu
 * @example
 * DELETE /api/settings/old_setting
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Ayar başarıyla silindi",
 *   "data": {
 *     "message": "Ayar başarıyla silindi"
 *   }
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "success": false,
 *   "message": "Ayar bulunamadı",
 *   "error": "Ayar bulunamadı"
 * }
 */
router.delete('/:settingName', userSettingsController.deleteSetting);

/**
 * ==============================================
 * HATA DURUMLARI VE HTTP STATUS KODLARI
 * ==============================================
 * 
 * 200 OK          - Başarılı GET, PUT, DELETE işlemleri
 * 201 Created     - Varsayılan ayarlar oluşturma
 * 207 Multi-Status - Kısmi başarılı bulk işlemler
 * 400 Bad Request - Validation hataları, tip uyumsuzlukları
 * 404 Not Found   - Ayar bulunamadığında
 * 500 Internal Server Error - Sunucu tarafı hatalar
 * 
 * ==============================================
 * ÖRNEK VALIDATION HATALARI
 * ==============================================
 * 
 * - Boş ayar adı: "Ayar adı gereklidir"
 * - Uzun ayar adı: "Ayar adı en fazla 100 karakter olabilir"
 * - Boş değer: "Ayar değeri gereklidir"
 * - Geçersiz tip: "setting_type string, number, boolean veya json olmalıdır"
 * - Geçersiz JSON: "JSON tipi için geçerli bir JSON formatı girilmelidir"
 * - Geçersiz sayı: "number tipi için sayısal bir değer girilmelidir"
 * - Uzun açıklama: "Açıklama en fazla 255 karakter olabilir"
 * 
 * ==============================================
 * DESTEKLENEN AYAR TİPLERİ
 * ==============================================
 * 
 * - string: Metin değerler (varsayılan)
 * - number: Sayısal değerler (otomatik parseFloat)
 * - boolean: true/false değerler (otomatik boolean dönüşümü)
 * - json: Karmaşık objeler (otomatik JSON parse/stringify)
 * 
 * ==============================================
 * ZORUNLU ALANLAR
 * ==============================================
 * 
 * PUT Request için:
 * - setting_value (any): Ayar değeri - zorunlu
 * 
 * ==============================================
 * OPSİYONEL ALANLAR
 * ==============================================
 * 
 * PUT Request için:
 * - setting_type (string): Ayar tipi (varsayılan: string)
 * - description (string): Ayar açıklaması (max 255 karakter)
 * 
 * Bulk Request için:
 * - settings (Array): Ayar listesi (max 50 ayar)
 *   - setting_name (string): Ayar adı - zorunlu
 *   - setting_value (any): Ayar değeri - zorunlu
 *   - setting_type (string): Ayar tipi (opsiyonel)
 *   - description (string): Açıklama (opsiyonel)
 * 
 * ==============================================
 * VARSAYILAN AYARLAR
 * ==============================================
 * 
 * POST /api/settings/initialize ile oluşturulan ayarlar:
 * - app_name: Uygulama adı
 * - currency: Ana para birimi (TRY)
 * - date_format: Tarih formatı (DD/MM/YYYY)
 * - decimal_places: Ondalık basamak (2)
 * - auto_backup: Otomatik yedekleme (true)
 * - backup_frequency: Yedekleme sıklığı (7 gün)
 * - email_notifications: Email bildirimleri (false)
 * - theme_settings: Tema ayarları (JSON)
 * - report_settings: Rapor ayarları (JSON)
 * 
 * ==============================================
 * KATEGORİ SİSTEMİ
 * ==============================================
 * 
 * Ayar adları kategori prefixi ile organize edilebilir:
 * - theme_color, theme_font -> theme kategorisi
 * - email_host, email_port -> email kategorisi
 * - backup_path, backup_schedule -> backup kategorisi
 * 
 * GET /api/settings/category/theme -> theme_ ile başlayan ayarları getirir
 */

// Router'ı dışa aktar
module.exports = router;