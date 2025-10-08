/**
 * @fileoverview Account Controller
 * @description HTTP request handlers for customer account operations
 * @version 1.0.0
 */

const Accounts = require('../models/accountModel');

/**
 * Customer Account Controller
 * @namespace accountController
 */
const accountController = {
    // Tüm cari hesapları getir - GET /api/accounts
    getAllAccounts: async (req, res) => {
        try {
            const result = await Accounts.getAllAccounts();
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Cari hesaplar başarıyla getirildi',
                    data: result.data,
                    count: result.data.length
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Cari hesaplar getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getAllAccounts Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // ID'ye göre cari hesap getir - GET /api/accounts/:id
    getAccountById: async (req, res) => {
        try {
            const { id } = req.params;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz cari hesap ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            const result = await Accounts.getAccountById(parseInt(id));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Cari hesap başarıyla getirildi',
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Cari hesap bulunamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getAccountById Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Yeni cari hesap oluştur - POST /api/accounts
    createAccount: async (req, res) => {
        try {
            const { ad_soyad, account_code, group_id, phone, email, address, tax_number, tax_office, balance, account_type } = req.body;
            
            // ad_soyad alanının boş olup olmadığını kontrol et
            if (!ad_soyad || ad_soyad.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Ad soyad alanı gereklidir',
                    error: 'ad_soyad alanı boş olamaz'
                });
            }

            // Ad soyad uzunluk kontrolü
            if (ad_soyad.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Ad soyad en az 2 karakter olmalıdır',
                    error: 'Geçersiz ad soyad'
                });
            }

            if (ad_soyad.trim().length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'Ad soyad en fazla 255 karakter olabilir',
                    error: 'Ad soyad çok uzun'
                });
            }

            // Cari kodu validasyonu (eğer belirtilmişse)
            if (account_code && (account_code.trim().length < 2 || account_code.trim().length > 50)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cari kodu 2-50 karakter arasında olmalıdır',
                    error: 'Geçersiz cari kodu'
                });
            }

            // Grup ID validasyonu (eğer belirtilmişse)
            if (group_id && isNaN(group_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz grup ID\'si',
                    error: 'Grup ID sayısal bir değer olmalıdır'
                });
            }

            // Telefon validasyonu (eğer belirtilmişse)
            if (phone && phone.trim().length > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Telefon numarası en fazla 20 karakter olabilir',
                    error: 'Telefon numarası çok uzun'
                });
            }

            // Email validasyonu (eğer belirtilmişse)
            if (email && email.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Email adresi en fazla 100 karakter olabilir',
                    error: 'Email adresi çok uzun'
                });
            }

            // Vergi numarası validasyonu (eğer belirtilmişse)
            if (tax_number && tax_number.trim().length > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Vergi numarası en fazla 20 karakter olabilir',
                    error: 'Vergi numarası çok uzun'
                });
            }

            // Bakiye validasyonu (eğer belirtilmişse)
            if (balance && isNaN(balance)) {
                return res.status(400).json({
                    success: false,
                    message: 'Bakiye sayısal bir değer olmalıdır',
                    error: 'Geçersiz bakiye değeri'
                });
            }

            // Hesap türü validasyonu (eğer belirtilmişse)
            if (account_type && !['customer', 'supplier', 'both'].includes(account_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz hesap türü',
                    error: 'Hesap türü customer, supplier veya both olmalıdır'
                });
            }

            // Model fonksiyonuna gönderilecek veri objesi
            const accountData = {
                account_name: ad_soyad.trim(),
                account_code: account_code ? account_code.trim() : null,
                group_id: group_id ? parseInt(group_id) : null,
                phone: phone ? phone.trim() : null,
                email: email ? email.trim() : null,
                address: address ? address.trim() : null,
                tax_number: tax_number ? tax_number.trim() : null,
                tax_office: tax_office ? tax_office.trim() : null,
                balance: balance ? parseFloat(balance) : 0,
                account_type: account_type || 'customer'
            };

            const result = await Accounts.createAccount(accountData);
            
            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: 'Cari hesap başarıyla oluşturuldu',
                    data: result.data
                });
            } else {
                // Duplicate error gibi durumlarda 400 Bad Request
                res.status(400).json({
                    success: false,
                    message: 'Cari hesap oluşturulamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('createAccount Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Cari hesabı güncelle - PUT /api/accounts/:id
    updateAccount: async (req, res) => {
        try {
            const { id } = req.params;
            const { ad_soyad, account_code, group_id, phone, email, address, tax_number, tax_office, balance, account_type } = req.body;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz cari hesap ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            // ad_soyad alanının boş olup olmadığını kontrol et
            if (!ad_soyad || ad_soyad.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Ad soyad alanı gereklidir',
                    error: 'ad_soyad alanı boş olamaz'
                });
            }

            // Ad soyad uzunluk kontrolü
            if (ad_soyad.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Ad soyad en az 2 karakter olmalıdır',
                    error: 'Geçersiz ad soyad'
                });
            }

            if (ad_soyad.trim().length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'Ad soyad en fazla 255 karakter olabilir',
                    error: 'Ad soyad çok uzun'
                });
            }

            // Diğer validasyonlar...
            if (account_code && (account_code.trim().length < 2 || account_code.trim().length > 50)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cari kodu 2-50 karakter arasında olmalıdır',
                    error: 'Geçersiz cari kodu'
                });
            }

            if (group_id && isNaN(group_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz grup ID\'si',
                    error: 'Grup ID sayısal bir değer olmalıdır'
                });
            }

            if (balance && isNaN(balance)) {
                return res.status(400).json({
                    success: false,
                    message: 'Bakiye sayısal bir değer olmalıdır',
                    error: 'Geçersiz bakiye değeri'
                });
            }

            if (account_type && !['customer', 'supplier', 'both'].includes(account_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz hesap türü',
                    error: 'Hesap türü customer, supplier veya both olmalıdır'
                });
            }

            // Model fonksiyonuna gönderilecek veri objesi
            const accountData = {
                account_name: ad_soyad.trim(),
                account_code: account_code ? account_code.trim() : null,
                group_id: group_id ? parseInt(group_id) : null,
                phone: phone ? phone.trim() : null,
                email: email ? email.trim() : null,
                address: address ? address.trim() : null,
                tax_number: tax_number ? tax_number.trim() : null,
                tax_office: tax_office ? tax_office.trim() : null,
                balance: balance !== undefined ? parseFloat(balance) : undefined,
                account_type: account_type
            };

            const result = await Accounts.updateAccount(parseInt(id), accountData);
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Cari hesap başarıyla güncellendi',
                    data: result.data
                });
            } else {
                // Hesap bulunamadı durumunda 404
                if (result.error.includes('bulunamadı')) {
                    res.status(404).json({
                        success: false,
                        message: 'Cari hesap bulunamadı',
                        error: result.error
                    });
                } else {
                    // Diğer durumlar 400 Bad Request
                    res.status(400).json({
                        success: false,
                        message: 'Cari hesap güncellenemedi',
                        error: result.error
                    });
                }
            }
        } catch (error) {
            console.error('updateAccount Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Cari hesabı sil - DELETE /api/accounts/:id
    deleteAccount: async (req, res) => {
        try {
            const { id } = req.params;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz cari hesap ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            const result = await Accounts.deleteAccount(parseInt(id));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Cari hesap başarıyla silindi',
                    data: result.data
                });
            } else {
                // Hesap bulunamadı durumunda 404
                if (result.error.includes('bulunamadı')) {
                    res.status(404).json({
                        success: false,
                        message: 'Cari hesap bulunamadı',
                        error: result.error
                    });
                } else {
                    // Foreign key constraint gibi durumlar 400 Bad Request
                    res.status(400).json({
                        success: false,
                        message: 'Cari hesap silinemedi',
                        error: result.error
                    });
                }
            }
        } catch (error) {
            console.error('deleteAccount Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Hesap türüne göre cari hesapları getir - GET /api/accounts/type/:type
    getAccountsByType: async (req, res) => {
        try {
            const { type } = req.params;
            
            // Hesap türü validasyonu
            if (!['customer', 'supplier', 'both'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz hesap türü',
                    error: 'Hesap türü customer, supplier veya both olmalıdır'
                });
            }

            const result = await Accounts.getAccountsByType(type);
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: `${type} türündeki cari hesaplar başarıyla getirildi`,
                    data: result.data,
                    count: result.data.length
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Cari hesaplar getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getAccountsByType Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Gruba göre cari hesapları getir - GET /api/accounts/group/:groupId
    getAccountsByGroup: async (req, res) => {
        try {
            const { groupId } = req.params;
            
            // Grup ID validasyonu
            if (!groupId || isNaN(groupId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz grup ID\'si',
                    error: 'Grup ID sayısal bir değer olmalıdır'
                });
            }

            const result = await Accounts.getAccountsByGroup(parseInt(groupId));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Gruba ait cari hesaplar başarıyla getirildi',
                    data: result.data,
                    count: result.data.length
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Cari hesaplar getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getAccountsByGroup Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Cari hesap arama - GET /api/accounts/search?q=searchTerm
    searchAccounts: async (req, res) => {
        try {
            const { q } = req.query;
            
            // Arama terimi validasyonu
            if (!q || q.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Arama terimi gereklidir',
                    error: 'q parametresi boş olamaz'
                });
            }

            if (q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Arama terimi en az 2 karakter olmalıdır',
                    error: 'Çok kısa arama terimi'
                });
            }

            const result = await Accounts.searchAccounts(q.trim());
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: `"${q}" için arama sonuçları`,
                    data: result.data,
                    count: result.data.length,
                    searchTerm: q.trim()
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Arama yapılamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('searchAccounts Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    }
};

module.exports = accountController;