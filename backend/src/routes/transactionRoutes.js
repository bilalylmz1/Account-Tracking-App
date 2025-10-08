/**
 * @fileoverview Transaction Routes
 * @description RESTful API routes for financial transaction management operations
 * @version 1.0.0
 */

const express = require('express');
const transactionController = require('../controllers/transactionController');

/**
 * Express Router instance for transaction routes
 */
const router = express.Router();

/**
 * ==============================================
 * Financial Transaction Management API Routes
 * ==============================================
 * Bu dosya finansal hareketlerin CRUD işlemleri,
 * filtreleme ve raporlama için gerekli API 
 * endpoint'lerini tanımlar.
 */

// ==============================================
// FİLTRELEME VE ARAMA ROUTE'LARI (Öncelik sırası önemli)
// ==============================================

/**
 * @route   GET /api/transactions/filter
 * @desc    Filtrelenmiş finansal hareketleri getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @query   {number} cari_id - Cari hesap ID filtresi
 * @query   {string} islem_tipi - İşlem türü filtresi (income/expense/receivable/payable)
 * @query   {number} min_tutar - Minimum tutar filtresi
 * @query   {number} max_tutar - Maksimum tutar filtresi
 * @query   {string} baslangic_tarihi - Başlangıç tarih filtresi (YYYY-MM-DD)
 * @query   {string} bitis_tarihi - Bitiş tarih filtresi (YYYY-MM-DD)
 * @query   {string} aciklama_icinde - Açıklama ve referans numarasında arama
 * @query   {string} status - İşlem durumu filtresi (completed/pending/cancelled)
 * @query   {string} payment_method - Ödeme yöntemi filtresi (cash/bank_transfer/check/credit_card)
 * @query   {number} limit - Sayfa başına kayıt sayısı (max 1000)
 * @query   {number} offset - Sayfalama offset değeri
 * @returns {Array} Filtrelenmiş işlem listesi
 * @example
 * GET /api/transactions/filter?cari_id=5&islem_tipi=income&min_tutar=100&max_tutar=5000&baslangic_tarihi=2024-01-01&bitis_tarihi=2024-12-31&limit=50&offset=0
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Filtrelenmiş işlemler başarıyla getirildi",
 *   "data": [
 *     {
 *       "id": 1,
 *       "account_id": 5,
 *       "account_name": "Ahmet Yılmaz",
 *       "account_code": "AH001",
 *       "transaction_type": "income",
 *       "amount": 1500.50,
 *       "description": "Fatura ödemesi",
 *       "reference_number": "FAT-2024-001",
 *       "transaction_date": "2024-10-08",
 *       "due_date": "2024-11-08",
 *       "payment_method": "bank_transfer",
 *       "status": "completed",
 *       "created_at": "2024-10-08T10:00:00.000Z"
 *     }
 *   ],
 *   "count": 1,
 *   "totalCount": 150,
 *   "filters": {
 *     "cari_id": 5,
 *     "islem_tipi": "income",
 *     "min_tutar": 100,
 *     "max_tutar": 5000
 *   }
 * }
 */
router.get('/filter', transactionController.getFilteredTransactions);

/**
 * @route   GET /api/transactions/summary
 * @desc    İşlem türlerine göre özet istatistikleri getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @returns {Array} İşlem türü bazında istatistikler
 * @example
 * GET /api/transactions/summary
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "İşlem özeti başarıyla getirildi",
 *   "data": [
 *     {
 *       "transaction_type": "income",
 *       "transaction_count": 25,
 *       "total_amount": 75000.00,
 *       "average_amount": 3000.00,
 *       "min_amount": 100.00,
 *       "max_amount": 10000.00
 *     }
 *   ]
 * }
 */
router.get('/summary', transactionController.getTransactionSummary);

/**
 * @route   GET /api/transactions/account/:accountId
 * @desc    Belirli bir cari hesaba ait tüm işlemleri getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} accountId - Cari hesap ID'si (zorunlu, pozitif sayı)
 * @returns {Array} Belirtilen cari hesaba ait işlemler
 * @example
 * GET /api/transactions/account/5
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Cari hesaba ait işlemler başarıyla getirildi",
 *   "data": [...],
 *   "count": 12,
 *   "accountId": 5
 * }
 */
router.get('/account/:accountId', transactionController.getTransactionsByAccount);

// ==============================================
// FİNANSAL HAREKETLER İLE İLGİLİ ANA ROUTE'LAR
// ==============================================

/**
 * @route   GET /api/transactions
 * @desc    Tüm finansal hareketleri listele (cari adlarıyla birlikte)
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @returns {Array} İşlem listesi (tarihe göre ters sıralı)
 * @example
 * Response:
 * {
 *   "success": true,
 *   "message": "İşlemler başarıyla getirildi",
 *   "data": [
 *     {
 *       "id": 1,
 *       "account_id": 5,
 *       "account_name": "Ahmet Yılmaz",
 *       "account_code": "AH001",
 *       "transaction_type": "income",
 *       "amount": 1500.50,
 *       "description": "Fatura ödemesi",
 *       "reference_number": "FAT-2024-001",
 *       "transaction_date": "2024-10-08",
 *       "due_date": null,
 *       "payment_method": "bank_transfer",
 *       "status": "completed",
 *       "created_at": "2024-10-08T10:00:00.000Z",
 *       "updated_at": "2024-10-08T10:00:00.000Z"
 *     }
 *   ],
 *   "count": 1
 * }
 */
router.get('/', transactionController.getAllTransactions);

/**
 * @route   POST /api/transactions
 * @desc    Yeni finansal hareket oluştur
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @body    {cari_id: number, islem_tipi: string, tutar: number, islem_tarihi: string, aciklama?: string, referans_no?: string, vade_tarihi?: string, odeme_yontemi?: string, durum?: string}
 * @returns {Object} Oluşturulan işlem bilgisi
 * @example
 * Request Body:
 * {
 *   "cari_id": 5,
 *   "islem_tipi": "income",
 *   "tutar": 1500.50,
 *   "islem_tarihi": "2024-10-08",
 *   "aciklama": "Fatura ödemesi alındı",
 *   "referans_no": "FAT-2024-001",
 *   "vade_tarihi": "2024-11-08",
 *   "odeme_yontemi": "bank_transfer",
 *   "durum": "completed"
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "İşlem başarıyla oluşturuldu",
 *   "data": {
 *     "id": 15,
 *     "account_id": 5,
 *     "transaction_type": "income",
 *     "amount": 1500.50,
 *     "message": "İşlem başarıyla oluşturuldu"
 *   }
 * }
 */
router.post('/', transactionController.createTransaction);

// ==============================================
// TEK İŞLEM İLE İLGİLİ ROUTE'LAR (:id parametreli)
// ==============================================

/**
 * @route   GET /api/transactions/:id
 * @desc    Belirli bir finansal hareketi ID ile getir
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - İşlem ID'si (zorunlu, pozitif sayı)
 * @returns {Object} İşlem detay bilgisi
 * @example
 * GET /api/transactions/15
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "İşlem başarıyla getirildi",
 *   "data": {
 *     "id": 15,
 *     "account_id": 5,
 *     "account_name": "Ahmet Yılmaz",
 *     "account_code": "AH001",
 *     "transaction_type": "income",
 *     "amount": 1500.50,
 *     "description": "Fatura ödemesi alındı",
 *     "reference_number": "FAT-2024-001",
 *     "transaction_date": "2024-10-08",
 *     "due_date": "2024-11-08",
 *     "payment_method": "bank_transfer",
 *     "status": "completed",
 *     "created_at": "2024-10-08T10:00:00.000Z",
 *     "updated_at": "2024-10-08T10:00:00.000Z"
 *   }
 * }
 */
router.get('/:id', transactionController.getTransactionById);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Mevcut finansal hareketi güncelle
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Güncellenecek işlem ID'si (zorunlu, pozitif sayı)
 * @body    {cari_id: number, islem_tipi: string, tutar: number, islem_tarihi: string, aciklama?: string, referans_no?: string, vade_tarihi?: string, odeme_yontemi?: string, durum?: string}
 * @returns {Object} Güncellenmiş işlem bilgisi
 * @note    Bakiye hesaplaması otomatik olarak yeniden yapılır
 * @example
 * PUT /api/transactions/15
 * Request Body:
 * {
 *   "cari_id": 5,
 *   "islem_tipi": "income",
 *   "tutar": 2000.75,
 *   "islem_tarihi": "2024-10-08",
 *   "aciklama": "Fatura ödemesi (güncellendi)",
 *   "referans_no": "FAT-2024-001-UPD",
 *   "odeme_yontemi": "cash",
 *   "durum": "completed"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "İşlem başarıyla güncellendi",
 *   "data": {
 *     "id": 15,
 *     "account_id": 5,
 *     "transaction_type": "income",
 *     "amount": 2000.75,
 *     "message": "İşlem başarıyla güncellendi"
 *   }
 * }
 */
router.put('/:id', transactionController.updateTransaction);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Mevcut finansal hareketi sil (soft delete)
 * @access  Public (şimdilik - ileride authentication eklenebilir)
 * @param   {number} id - Silinecek işlem ID'si (zorunlu, pozitif sayı)
 * @returns {Object} Silme işlemi sonucu
 * @note    Bakiye otomatik olarak düzeltilir (işlem etkisi geri alınır)
 * @example
 * DELETE /api/transactions/15
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "İşlem başarıyla silindi",
 *   "data": {
 *     "message": "İşlem başarıyla silindi"
 *   }
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "success": false,
 *   "message": "İşlem bulunamadı",
 *   "error": "İşlem bulunamadı"
 * }
 */
router.delete('/:id', transactionController.deleteTransaction);

/**
 * ==============================================
 * HATA DURUMLARI VE HTTP STATUS KODLARI
 * ==============================================
 * 
 * 200 OK          - Başarılı GET, PUT, DELETE işlemleri
 * 201 Created     - Başarılı POST işlemleri (yeni işlem oluşturma)
 * 400 Bad Request - Validation hataları, duplicate referans numarası
 * 404 Not Found   - İşlem bulunamadığında
 * 500 Internal Server Error - Sunucu tarafı hatalar
 * 
 * ==============================================
 * ÖRNEK VALIDATION HATALARI
 * ==============================================
 * 
 * - Boş cari ID: "Cari ID gereklidir"
 * - Geçersiz işlem tipi: "İşlem tipi income, expense, receivable veya payable olmalıdır"
 * - Boş tutar: "Tutar gereklidir"
 * - Negatif tutar: "tutar alanı pozitif olmalıdır"
 * - Boş işlem tarihi: "İşlem tarihi gereklidir"
 * - Geçersiz tarih formatı: "İşlem tarihi YYYY-MM-DD formatında olmalıdır"
 * - Geçersiz ID: "ID sayısal bir değer olmalıdır"
 * - Duplicate referans: "Bu referans numarası zaten kullanılıyor"
 * - Geçersiz cari hesap: "Belirtilen cari hesap bulunamadı"
 * - Çok büyük tutar: "Tutar 999,999,999.99 değerinden küçük olmalıdır"
 * 
 * ==============================================
 * ZORUNLU ALANLAR
 * ==============================================
 * 
 * - cari_id (number): Cari hesap ID'si - zorunlu
 * - islem_tipi (string): İşlem türü - zorunlu (income/expense/receivable/payable)
 * - tutar (number): İşlem tutarı - zorunlu (pozitif sayı)
 * - islem_tarihi (string): İşlem tarihi - zorunlu (YYYY-MM-DD formatı)
 * 
 * ==============================================
 * OPSİYONEL ALANLAR
 * ==============================================
 * 
 * - aciklama (string): İşlem açıklaması (max 1000 karakter)
 * - referans_no (string): Referans numarası (benzersiz, max 100 karakter)
 * - vade_tarihi (string): Vade tarihi (YYYY-MM-DD formatı)
 * - odeme_yontemi (string): Ödeme yöntemi (cash/bank_transfer/check/credit_card, varsayılan: cash)
 * - durum (string): İşlem durumu (completed/pending/cancelled, varsayılan: completed)
 * 
 * ==============================================
 * İŞLEM TÜRLERİ VE BAKİYE ETKİLERİ
 * ==============================================
 * 
 * - income (Gelir): Bakiyeyi artırır (+)
 * - expense (Gider): Bakiyeyi azaltır (-)
 * - receivable (Alacak): Bakiyeyi artırır (+)
 * - payable (Borç): Bakiyeyi azaltır (-)
 * 
 * ==============================================
 * ÖDEME YÖNTEMLERİ
 * ==============================================
 * 
 * - cash: Nakit
 * - bank_transfer: Banka havalesi
 * - check: Çek
 * - credit_card: Kredi kartı
 * 
 * ==============================================
 * İŞLEM DURUMLARI
 * ==============================================
 * 
 * - completed: Tamamlandı
 * - pending: Beklemede
 * - cancelled: İptal edildi
 */

// Router'ı dışa aktar
module.exports = router;