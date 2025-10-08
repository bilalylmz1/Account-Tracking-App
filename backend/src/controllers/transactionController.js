/**
 * @fileoverview Transaction Controller
 * @description HTTP request handlers for financial transaction operations
 * @version 1.0.0
 */

const Transactions = require('../models/transactionModel');

/**
 * Financial Transaction Controller
 * @namespace transactionController
 */
const transactionController = {
    // Tüm işlemleri getir - GET /api/transactions
    getAllTransactions: async (req, res) => {
        try {
            const result = await Transactions.getAllTransactions();
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'İşlemler başarıyla getirildi',
                    data: result.data,
                    count: result.data.length
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'İşlemler getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getAllTransactions Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // ID'ye göre işlem getir - GET /api/transactions/:id
    getTransactionById: async (req, res) => {
        try {
            const { id } = req.params;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz işlem ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            const result = await Transactions.getTransactionById(parseInt(id));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'İşlem başarıyla getirildi',
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'İşlem bulunamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getTransactionById Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Yeni işlem oluştur - POST /api/transactions
    createTransaction: async (req, res) => {
        try {
            const { 
                cari_id, 
                islem_tipi, 
                tutar, 
                islem_tarihi, 
                aciklama, 
                referans_no, 
                vade_tarihi, 
                odeme_yontemi, 
                durum 
            } = req.body;
            
            // Zorunlu alanları kontrol et
            if (!cari_id || isNaN(cari_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cari ID gereklidir',
                    error: 'cari_id alanı boş olamaz ve sayısal olmalıdır'
                });
            }

            if (!islem_tipi || !['income', 'expense', 'receivable', 'payable'].includes(islem_tipi)) {
                return res.status(400).json({
                    success: false,
                    message: 'İşlem tipi gereklidir',
                    error: 'islem_tipi alanı income, expense, receivable veya payable olmalıdır'
                });
            }

            if (!tutar || isNaN(tutar) || parseFloat(tutar) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutar gereklidir',
                    error: 'tutar alanı boş olamaz, sayısal ve pozitif olmalıdır'
                });
            }

            if (!islem_tarihi) {
                return res.status(400).json({
                    success: false,
                    message: 'İşlem tarihi gereklidir',
                    error: 'islem_tarihi alanı boş olamaz'
                });
            }

            // Tarih format validasyonu
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(islem_tarihi)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz işlem tarihi formatı',
                    error: 'İşlem tarihi YYYY-MM-DD formatında olmalıdır'
                });
            }

            // Vade tarihi format kontrolü (eğer belirtilmişse)
            if (vade_tarihi && !dateRegex.test(vade_tarihi)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz vade tarihi formatı',
                    error: 'Vade tarihi YYYY-MM-DD formatında olmalıdır'
                });
            }

            // Ödeme yöntemi validasyonu (eğer belirtilmişse)
            if (odeme_yontemi && !['cash', 'bank_transfer', 'check', 'credit_card'].includes(odeme_yontemi)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz ödeme yöntemi',
                    error: 'Ödeme yöntemi cash, bank_transfer, check veya credit_card olmalıdır'
                });
            }

            // Durum validasyonu (eğer belirtilmişse)
            if (durum && !['completed', 'pending', 'cancelled'].includes(durum)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz durum',
                    error: 'Durum completed, pending veya cancelled olmalıdır'
                });
            }

            // Tutar değer kontrolü
            if (parseFloat(tutar) > 999999999.99) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutar çok büyük',
                    error: 'Tutar 999,999,999.99 değerinden küçük olmalıdır'
                });
            }

            // Açıklama uzunluk kontrolü (eğer belirtilmişse)
            if (aciklama && aciklama.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Açıklama çok uzun',
                    error: 'Açıklama en fazla 1000 karakter olabilir'
                });
            }

            // Referans numarası uzunluk kontrolü (eğer belirtilmişse)
            if (referans_no && referans_no.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Referans numarası çok uzun',
                    error: 'Referans numarası en fazla 100 karakter olabilir'
                });
            }

            // Model fonksiyonuna gönderilecek veri objesi
            const transactionData = {
                account_id: parseInt(cari_id),
                transaction_type: islem_tipi,
                amount: parseFloat(tutar),
                description: aciklama || null,
                reference_number: referans_no || null,
                transaction_date: islem_tarihi,
                due_date: vade_tarihi || null,
                payment_method: odeme_yontemi || 'cash',
                status: durum || 'completed'
            };

            const result = await Transactions.createTransaction(transactionData);
            
            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: 'İşlem başarıyla oluşturuldu',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'İşlem oluşturulamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('createTransaction Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // İşlemi güncelle - PUT /api/transactions/:id
    updateTransaction: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                cari_id, 
                islem_tipi, 
                tutar, 
                islem_tarihi, 
                aciklama, 
                referans_no, 
                vade_tarihi, 
                odeme_yontemi, 
                durum 
            } = req.body;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz işlem ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            // Zorunlu alanları kontrol et (createTransaction ile aynı validasyonlar)
            if (!cari_id || isNaN(cari_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cari ID gereklidir',
                    error: 'cari_id alanı boş olamaz ve sayısal olmalıdır'
                });
            }

            if (!islem_tipi || !['income', 'expense', 'receivable', 'payable'].includes(islem_tipi)) {
                return res.status(400).json({
                    success: false,
                    message: 'İşlem tipi gereklidir',
                    error: 'islem_tipi alanı income, expense, receivable veya payable olmalıdır'
                });
            }

            if (!tutar || isNaN(tutar) || parseFloat(tutar) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutar gereklidir',
                    error: 'tutar alanı boş olamaz, sayısal ve pozitif olmalıdır'
                });
            }

            if (!islem_tarihi) {
                return res.status(400).json({
                    success: false,
                    message: 'İşlem tarihi gereklidir',
                    error: 'islem_tarihi alanı boş olamaz'
                });
            }

            // Diğer validasyonlar...
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(islem_tarihi)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz işlem tarihi formatı',
                    error: 'İşlem tarihi YYYY-MM-DD formatında olmalıdır'
                });
            }

            if (vade_tarihi && !dateRegex.test(vade_tarihi)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz vade tarihi formatı',
                    error: 'Vade tarihi YYYY-MM-DD formatında olmalıdır'
                });
            }

            if (parseFloat(tutar) > 999999999.99) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutar çok büyük',
                    error: 'Tutar 999,999,999.99 değerinden küçük olmalıdır'
                });
            }

            // Model fonksiyonuna gönderilecek veri objesi
            const transactionData = {
                account_id: parseInt(cari_id),
                transaction_type: islem_tipi,
                amount: parseFloat(tutar),
                description: aciklama || null,
                reference_number: referans_no || null,
                transaction_date: islem_tarihi,
                due_date: vade_tarihi || null,
                payment_method: odeme_yontemi || 'cash',
                status: durum || 'completed'
            };

            const result = await Transactions.updateTransaction(parseInt(id), transactionData);
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'İşlem başarıyla güncellendi',
                    data: result.data
                });
            } else {
                if (result.error.includes('bulunamadı')) {
                    res.status(404).json({
                        success: false,
                        message: 'İşlem bulunamadı',
                        error: result.error
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: 'İşlem güncellenemedi',
                        error: result.error
                    });
                }
            }
        } catch (error) {
            console.error('updateTransaction Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // İşlemi sil - DELETE /api/transactions/:id
    deleteTransaction: async (req, res) => {
        try {
            const { id } = req.params;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz işlem ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            const result = await Transactions.deleteTransaction(parseInt(id));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'İşlem başarıyla silindi',
                    data: result.data
                });
            } else {
                if (result.error.includes('bulunamadı')) {
                    res.status(404).json({
                        success: false,
                        message: 'İşlem bulunamadı',
                        error: result.error
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: 'İşlem silinemedi',
                        error: result.error
                    });
                }
            }
        } catch (error) {
            console.error('deleteTransaction Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Filtrelenmiş işlemleri getir - GET /api/transactions/filter
    getFilteredTransactions: async (req, res) => {
        try {
            const {
                cari_id,
                islem_tipi,
                min_tutar,
                max_tutar,
                baslangic_tarihi,
                bitis_tarihi,
                aciklama_icinde,
                status,
                payment_method,
                limit,
                offset
            } = req.query;

            // Filtre parametrelerini hazırla
            const filters = {};

            // Cari ID filtresi
            if (cari_id && !isNaN(cari_id)) {
                filters.cari_id = parseInt(cari_id);
            } else if (cari_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz cari ID',
                    error: 'cari_id sayısal bir değer olmalıdır'
                });
            }

            // İşlem tipi filtresi
            if (islem_tipi) {
                if (['income', 'expense', 'receivable', 'payable'].includes(islem_tipi)) {
                    filters.islem_tipi = islem_tipi;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Geçersiz işlem tipi',
                        error: 'İşlem tipi income, expense, receivable veya payable olmalıdır'
                    });
                }
            }

            // Tutar filtreleri
            if (min_tutar && !isNaN(min_tutar)) {
                filters.min_tutar = parseFloat(min_tutar);
            } else if (min_tutar) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz minimum tutar',
                    error: 'min_tutar sayısal bir değer olmalıdır'
                });
            }

            if (max_tutar && !isNaN(max_tutar)) {
                filters.max_tutar = parseFloat(max_tutar);
            } else if (max_tutar) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz maksimum tutar',
                    error: 'max_tutar sayısal bir değer olmalıdır'
                });
            }

            // Tarih filtreleri
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            
            if (baslangic_tarihi) {
                if (dateRegex.test(baslangic_tarihi)) {
                    filters.baslangic_tarihi = baslangic_tarihi;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Geçersiz başlangıç tarihi formatı',
                        error: 'Başlangıç tarihi YYYY-MM-DD formatında olmalıdır'
                    });
                }
            }

            if (bitis_tarihi) {
                if (dateRegex.test(bitis_tarihi)) {
                    filters.bitis_tarihi = bitis_tarihi;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Geçersiz bitiş tarihi formatı',
                        error: 'Bitiş tarihi YYYY-MM-DD formatında olmalıdır'
                    });
                }
            }

            // Açıklama arama filtresi
            if (aciklama_icinde && aciklama_icinde.trim() !== '') {
                if (aciklama_icinde.trim().length >= 2) {
                    filters.aciklama_icinde = aciklama_icinde.trim();
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Arama terimi çok kısa',
                        error: 'Arama terimi en az 2 karakter olmalıdır'
                    });
                }
            }

            // Durum filtresi
            if (status) {
                if (['completed', 'pending', 'cancelled'].includes(status)) {
                    filters.status = status;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Geçersiz durum',
                        error: 'Durum completed, pending veya cancelled olmalıdır'
                    });
                }
            }

            // Ödeme yöntemi filtresi
            if (payment_method) {
                if (['cash', 'bank_transfer', 'check', 'credit_card'].includes(payment_method)) {
                    filters.payment_method = payment_method;
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Geçersiz ödeme yöntemi',
                        error: 'Ödeme yöntemi cash, bank_transfer, check veya credit_card olmalıdır'
                    });
                }
            }

            // Sayfalama parametreleri
            if (limit && !isNaN(limit)) {
                filters.limit = Math.min(parseInt(limit), 1000); // Max 1000 kayıt
            } else if (limit) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz limit değeri',
                    error: 'limit sayısal bir değer olmalıdır'
                });
            }

            if (offset && !isNaN(offset)) {
                filters.offset = parseInt(offset);
            } else if (offset) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz offset değeri',
                    error: 'offset sayısal bir değer olmalıdır'
                });
            }

            const result = await Transactions.getFilteredTransactions(filters);
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Filtrelenmiş işlemler başarıyla getirildi',
                    data: result.data,
                    count: result.data.length,
                    totalCount: result.totalCount,
                    filters: result.filters
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Filtrelenmiş işlemler getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getFilteredTransactions Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Cari hesaba ait işlemleri getir - GET /api/transactions/account/:accountId
    getTransactionsByAccount: async (req, res) => {
        try {
            const { accountId } = req.params;
            
            if (!accountId || isNaN(accountId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz cari hesap ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            const result = await Transactions.getTransactionsByAccount(parseInt(accountId));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Cari hesaba ait işlemler başarıyla getirildi',
                    data: result.data,
                    count: result.data.length,
                    accountId: parseInt(accountId)
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'İşlemler getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getTransactionsByAccount Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // İşlem özeti getir - GET /api/transactions/summary
    getTransactionSummary: async (req, res) => {
        try {
            const result = await Transactions.getTransactionSummaryByType();
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'İşlem özeti başarıyla getirildi',
                    data: result.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'İşlem özeti getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getTransactionSummary Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    }
};

module.exports = transactionController;