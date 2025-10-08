/**
 * @fileoverview Account Groups Routes
 * @description RESTful API routes for account group management operations
 * @version 1.0.0
 */

const express = require('express');
const groupController = require('../controllers/groupController');

/**
 * Express Router instance for group routes
 */
const router = express.Router();

/**
 * ==============================================
 * Account Group Management API Routes
 * ==============================================
 * This module defines RESTful API endpoints for
 * account group CRUD operations and management
 */

/**
 * ==============================================
 * Primary Group Management Routes
 * ==============================================
 */

/**
 * @route   GET /api/groups
 * @desc    Tüm cari hesap gruplarını listele
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @returns {Array} Grup listesi (alfabetik sıralı)
 * @example
 * Response:
 * {
 *   "success": true,
 *   "message": "Gruplar başarıyla getirildi",
 *   "data": [
 *     {
 *       "id": 1,
 *       "group_name": "Müşteriler",
 *       "created_at": "2024-01-01T12:00:00.000Z",
 *       "updated_at": "2024-01-01T12:00:00.000Z"
 *     }
 *   ],
 *   "count": 1
 * }
 */
router.get('/', groupController.getAllGroups);

/**
 * @route   POST /api/groups
 * @desc    Yeni cari hesap grubu oluştur
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @body    {grup_adi: string} - Grup adı (zorunlu, 2-100 karakter)
 * @returns {Object} Oluşturulan grup bilgisi
 * @example
 * Request Body:
 * {
 *   "grup_adi": "Tedarikçiler"
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Grup başarıyla oluşturuldu",
 *   "data": {
 *     "id": 2,
 *     "group_name": "Tedarikçiler",
 *     "message": "Grup başarıyla oluşturuldu"
 *   }
 * }
 */
router.post('/', groupController.createGroup);

// ==============================================
// TEK GRUP İLE İLGİLİ ROUTE'LAR (:id parametreli)
// ==============================================

/**
 * @route   GET /api/groups/:id
 * @desc    Belirli bir cari hesap grubunu ID ile getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Grup ID'si (zorunlu, pozitif sayı)
 * @returns {Object} Grup detay bilgisi
 * @example
 * GET /api/groups/1
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Grup başarıyla getirildi",
 *   "data": {
 *     "id": 1,
 *     "group_name": "Müşteriler",
 *     "created_at": "2024-01-01T12:00:00.000Z",
 *     "updated_at": "2024-01-01T12:00:00.000Z"
 *   }
 * }
 */
router.get('/:id', groupController.getGroupById);

/**
 * @route   PUT /api/groups/:id
 * @desc    Mevcut cari hesap grubunu güncelle
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Güncellenecek grup ID'si (zorunlu, pozitif sayı)
 * @body    {grup_adi: string} - Yeni grup adı (zorunlu, 2-100 karakter)
 * @returns {Object} Güncellenmiş grup bilgisi
 * @example
 * PUT /api/groups/1
 * Request Body:
 * {
 *   "grup_adi": "Kurumsal Müşteriler"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Grup başarıyla güncellendi",
 *   "data": {
 *     "id": 1,
 *     "group_name": "Kurumsal Müşteriler",
 *     "message": "Grup başarıyla güncellendi"
 *   }
 * }
 */
router.put('/:id', groupController.updateGroup);

/**
 * @route   DELETE /api/groups/:id
 * @desc    Mevcut cari hesap grubunu sil
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Silinecek grup ID'si (zorunlu, pozitif sayı)
 * @returns {Object} Silme işlemi sonucu
 * @note    Eğer gruba bağlı hesaplar varsa silme işlemi başarısız olur
 * @example
 * DELETE /api/groups/1
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Grup başarıyla silindi",
 *   "data": {
 *     "message": "Grup başarıyla silindi"
 *   }
 * }
 * 
 * Error Response (400 Bad Request):
 * {
 *   "success": false,
 *   "message": "Grup silinemedi",
 *   "error": "Bu gruba bağlı 5 hesap bulunduğu için silinemez"
 * }
 */
router.delete('/:id', groupController.deleteGroup);

// ==============================================
// EK YARDIMCI ROUTE'LAR
// ==============================================

/**
 * @route   GET /api/groups/:id/accounts/count
 * @desc    Belirli bir gruba bağlı hesap sayısını getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Grup ID'si (zorunlu, pozitif sayı)
 * @returns {Object} Hesap sayısı bilgisi
 * @example
 * GET /api/groups/1/accounts/count
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Hesap sayısı başarıyla getirildi",
 *   "data": {
 *     "group_id": 1,
 *     "account_count": 5
 *   }
 * }
 */
router.get('/:id/accounts/count', groupController.getGroupAccountCount);

/**
 * ==============================================
 * HATA DURUMLARI VE HTTP STATUS KODLARI
 * ==============================================
 * 
 * 200 OK          - Başarılı GET, PUT, DELETE işlemleri
 * 201 Created     - Başarılı POST işlemleri (yeni grup oluşturma)
 * 400 Bad Request - Validation hataları, duplicate grup adı, bağlı hesaplar varken silme
 * 404 Not Found   - Grup bulunamadığında
 * 500 Internal Server Error - Sunucu tarafı hatalar
 * 
 * ==============================================
 * ÖRNEK VALIDATION HATALARI
 * ==============================================
 * 
 * - Boş grup adı: "Grup adı gereklidir"
 * - Çok kısa grup adı: "Grup adı en az 2 karakter olmalıdır"
 * - Çok uzun grup adı: "Grup adı en fazla 100 karakter olabilir"
 * - Geçersiz ID: "ID sayısal bir değer olmalıdır"
 * - Duplicate grup: "Bu isimde bir grup zaten mevcut"
 */

// Router'ı dışa aktar
module.exports = router;