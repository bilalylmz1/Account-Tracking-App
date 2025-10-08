/**
 * @fileoverview Transactions Model
 * @description Database operations for financial transaction management
 * @version 1.0.0
 */

const db = require('../config/db');

/**
 * Financial Transactions Model
 * @namespace Transactions
 */
const Transactions = {
    // Tüm finansal hareketleri cari adlarıyla birlikte getir
    getAllTransactions: async () => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    t.id,
                    t.account_id,
                    a.account_name,
                    a.account_code,
                    t.transaction_type,
                    t.amount,
                    t.description,
                    t.reference_number,
                    t.transaction_date,
                    t.due_date,
                    t.payment_method,
                    t.status,
                    t.created_at,
                    t.updated_at
                FROM transactions t
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.is_active = 1
                ORDER BY t.transaction_date DESC, t.created_at DESC
            `);
            
            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('getAllTransactions Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // ID'ye göre işlem getir (cari adıyla birlikte)
    getTransactionById: async (id) => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    t.id,
                    t.account_id,
                    a.account_name,
                    a.account_code,
                    t.transaction_type,
                    t.amount,
                    t.description,
                    t.reference_number,
                    t.transaction_date,
                    t.due_date,
                    t.payment_method,
                    t.status,
                    t.created_at,
                    t.updated_at
                FROM transactions t
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.id = ? AND t.is_active = 1
            `, [id]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'İşlem bulunamadı'
                };
            }

            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('getTransactionById Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Yeni işlem oluştur
    createTransaction: async (data) => {
        try {
            const {
                account_id,
                transaction_type,
                amount,
                description = null,
                reference_number = null,
                transaction_date,
                due_date = null,
                payment_method = 'cash',
                status = 'completed'
            } = data;

            // Zorunlu alanları kontrol et
            if (!account_id) {
                return {
                    success: false,
                    error: 'Cari hesap ID\'si gereklidir'
                };
            }

            if (!transaction_type || !['income', 'expense', 'receivable', 'payable'].includes(transaction_type)) {
                return {
                    success: false,
                    error: 'Geçersiz işlem türü (income/expense/receivable/payable)'
                };
            }

            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
                return {
                    success: false,
                    error: 'Geçerli bir tutar girilmelidir'
                };
            }

            if (!transaction_date) {
                return {
                    success: false,
                    error: 'İşlem tarihi gereklidir'
                };
            }

            // Cari hesap varlığını kontrol et
            const [accountExists] = await db.execute(
                'SELECT id FROM accounts WHERE id = ? AND is_active = 1',
                [account_id]
            );

            if (accountExists.length === 0) {
                return {
                    success: false,
                    error: 'Belirtilen cari hesap bulunamadı'
                };
            }

            // Referans numarası benzersizlik kontrolü (eğer belirtilmişse)
            if (reference_number) {
                const [existingRef] = await db.execute(
                    'SELECT id FROM transactions WHERE reference_number = ? AND is_active = 1',
                    [reference_number]
                );

                if (existingRef.length > 0) {
                    return {
                        success: false,
                        error: 'Bu referans numarası zaten kullanılıyor'
                    };
                }
            }

            const [result] = await db.execute(`
                INSERT INTO transactions (
                    account_id, transaction_type, amount, description, 
                    reference_number, transaction_date, due_date, 
                    payment_method, status, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
            `, [
                parseInt(account_id),
                transaction_type,
                parseFloat(amount),
                description,
                reference_number,
                transaction_date,
                due_date,
                payment_method,
                status
            ]);

            // Cari hesap bakiyesini güncelle
            await Transactions.updateAccountBalance(account_id, transaction_type, parseFloat(amount), 'add');

            return {
                success: true,
                data: {
                    id: result.insertId,
                    account_id: parseInt(account_id),
                    transaction_type,
                    amount: parseFloat(amount),
                    message: 'İşlem başarıyla oluşturuldu'
                }
            };
        } catch (error) {
            console.error('createTransaction Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // İşlemi güncelle
    updateTransaction: async (id, data) => {
        try {
            // İşlem var mı kontrol et
            const existingTransaction = await Transactions.getTransactionById(id);
            if (!existingTransaction.success) {
                return existingTransaction;
            }

            const oldTransaction = existingTransaction.data;
            
            const {
                account_id,
                transaction_type,
                amount,
                description,
                reference_number,
                transaction_date,
                due_date,
                payment_method,
                status
            } = data;

            // Zorunlu alanları kontrol et
            if (!account_id) {
                return {
                    success: false,
                    error: 'Cari hesap ID\'si gereklidir'
                };
            }

            if (!transaction_type || !['income', 'expense', 'receivable', 'payable'].includes(transaction_type)) {
                return {
                    success: false,
                    error: 'Geçersiz işlem türü'
                };
            }

            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
                return {
                    success: false,
                    error: 'Geçerli bir tutar girilmelidir'
                };
            }

            // Cari hesap varlığını kontrol et
            const [accountExists] = await db.execute(
                'SELECT id FROM accounts WHERE id = ? AND is_active = 1',
                [account_id]
            );

            if (accountExists.length === 0) {
                return {
                    success: false,
                    error: 'Belirtilen cari hesap bulunamadı'
                };
            }

            // Referans numarası benzersizlik kontrolü (kendisi hariç)
            if (reference_number) {
                const [existingRef] = await db.execute(
                    'SELECT id FROM transactions WHERE reference_number = ? AND id != ? AND is_active = 1',
                    [reference_number, id]
                );

                if (existingRef.length > 0) {
                    return {
                        success: false,
                        error: 'Bu referans numarası başka bir işlem tarafından kullanılıyor'
                    };
                }
            }

            // Eski işlemin bakiye etkisini geri al
            await Transactions.updateAccountBalance(
                oldTransaction.account_id,
                oldTransaction.transaction_type,
                oldTransaction.amount,
                'subtract'
            );

            const [result] = await db.execute(`
                UPDATE transactions SET 
                    account_id = ?, 
                    transaction_type = ?, 
                    amount = ?, 
                    description = ?, 
                    reference_number = ?, 
                    transaction_date = ?, 
                    due_date = ?, 
                    payment_method = ?, 
                    status = ?,
                    updated_at = NOW()
                WHERE id = ? AND is_active = 1
            `, [
                parseInt(account_id),
                transaction_type,
                parseFloat(amount),
                description || null,
                reference_number || null,
                transaction_date,
                due_date || null,
                payment_method || oldTransaction.payment_method,
                status || oldTransaction.status,
                id
            ]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'İşlem güncellenemedi'
                };
            }

            // Yeni işlemin bakiye etkisini uygula
            await Transactions.updateAccountBalance(
                parseInt(account_id),
                transaction_type,
                parseFloat(amount),
                'add'
            );

            return {
                success: true,
                data: {
                    id: parseInt(id),
                    account_id: parseInt(account_id),
                    transaction_type,
                    amount: parseFloat(amount),
                    message: 'İşlem başarıyla güncellendi'
                }
            };
        } catch (error) {
            console.error('updateTransaction Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // İşlemi sil (soft delete)
    deleteTransaction: async (id) => {
        try {
            // İşlem var mı kontrol et
            const existingTransaction = await Transactions.getTransactionById(id);
            if (!existingTransaction.success) {
                return existingTransaction;
            }

            const transaction = existingTransaction.data;

            // Soft delete - is_active = 0
            const [result] = await db.execute(
                'UPDATE transactions SET is_active = 0, updated_at = NOW() WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'İşlem silinemedi'
                };
            }

            // Bakiye etkisini geri al
            await Transactions.updateAccountBalance(
                transaction.account_id,
                transaction.transaction_type,
                transaction.amount,
                'subtract'
            );

            return {
                success: true,
                data: {
                    message: 'İşlem başarıyla silindi'
                }
            };
        } catch (error) {
            console.error('deleteTransaction Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Filtrelenmiş işlemleri getir
    getFilteredTransactions: async (filters) => {
        try {
            let baseQuery = `
                SELECT 
                    t.id,
                    t.account_id,
                    a.account_name,
                    a.account_code,
                    t.transaction_type,
                    t.amount,
                    t.description,
                    t.reference_number,
                    t.transaction_date,
                    t.due_date,
                    t.payment_method,
                    t.status,
                    t.created_at
                FROM transactions t
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.is_active = 1
            `;

            const conditions = [];
            const params = [];

            // Cari ID filtresi
            if (filters.cari_id && !isNaN(filters.cari_id)) {
                conditions.push('t.account_id = ?');
                params.push(parseInt(filters.cari_id));
            }

            // İşlem tipi filtresi
            if (filters.islem_tipi && ['income', 'expense', 'receivable', 'payable'].includes(filters.islem_tipi)) {
                conditions.push('t.transaction_type = ?');
                params.push(filters.islem_tipi);
            }

            // Minimum tutar filtresi
            if (filters.min_tutar && !isNaN(filters.min_tutar)) {
                conditions.push('t.amount >= ?');
                params.push(parseFloat(filters.min_tutar));
            }

            // Maksimum tutar filtresi
            if (filters.max_tutar && !isNaN(filters.max_tutar)) {
                conditions.push('t.amount <= ?');
                params.push(parseFloat(filters.max_tutar));
            }

            // Başlangıç tarihi filtresi
            if (filters.baslangic_tarihi) {
                conditions.push('t.transaction_date >= ?');
                params.push(filters.baslangic_tarihi);
            }

            // Bitiş tarihi filtresi
            if (filters.bitis_tarihi) {
                conditions.push('t.transaction_date <= ?');
                params.push(filters.bitis_tarihi);
            }

            // Açıklama arama filtresi
            if (filters.aciklama_icinde && filters.aciklama_icinde.trim() !== '') {
                conditions.push('(t.description LIKE ? OR t.reference_number LIKE ?)');
                const searchTerm = `%${filters.aciklama_icinde.trim()}%`;
                params.push(searchTerm, searchTerm);
            }

            // Durum filtresi
            if (filters.status && ['completed', 'pending', 'cancelled'].includes(filters.status)) {
                conditions.push('t.status = ?');
                params.push(filters.status);
            }

            // Ödeme yöntemi filtresi
            if (filters.payment_method) {
                conditions.push('t.payment_method = ?');
                params.push(filters.payment_method);
            }

            // Koşulları sorguya ekle
            if (conditions.length > 0) {
                baseQuery += ' AND ' + conditions.join(' AND ');
            }

            // Sıralama
            baseQuery += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

            // Limit filtresi (sayfalama için)
            if (filters.limit && !isNaN(filters.limit)) {
                baseQuery += ' LIMIT ?';
                params.push(parseInt(filters.limit));
                
                if (filters.offset && !isNaN(filters.offset)) {
                    baseQuery = baseQuery.replace('LIMIT ?', 'LIMIT ? OFFSET ?');
                    params.push(parseInt(filters.offset));
                }
            }

            const [rows] = await db.execute(baseQuery, params);

            // Toplam kayıt sayısını al (sayfalama için)
            let countQuery = `
                SELECT COUNT(*) as total
                FROM transactions t
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.is_active = 1
            `;

            if (conditions.length > 0) {
                countQuery += ' AND ' + conditions.join(' AND ');
            }

            // Count sorgusu için parametreleri hazırla (limit ve offset hariç)
            const countParams = params.slice(0, conditions.length * (filters.aciklama_icinde ? 2 : 1));
            const [countResult] = await db.execute(countQuery, countParams);

            return {
                success: true,
                data: rows,
                totalCount: countResult[0].total,
                filters: filters
            };
        } catch (error) {
            console.error('getFilteredTransactions Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Cari hesap bakiyesini güncelle
    updateAccountBalance: async (accountId, transactionType, amount, operation) => {
        try {
            let balanceChange = 0;
            
            // İşlem tipine göre bakiye değişimini hesapla
            if (operation === 'add') {
                if (transactionType === 'income' || transactionType === 'receivable') {
                    balanceChange = amount; // Pozitif
                } else if (transactionType === 'expense' || transactionType === 'payable') {
                    balanceChange = -amount; // Negatif
                }
            } else if (operation === 'subtract') {
                if (transactionType === 'income' || transactionType === 'receivable') {
                    balanceChange = -amount; // Pozitif işlemi geri al
                } else if (transactionType === 'expense' || transactionType === 'payable') {
                    balanceChange = amount; // Negatif işlemi geri al
                }
            }

            await db.execute(
                'UPDATE accounts SET balance = balance + ?, updated_at = NOW() WHERE id = ?',
                [balanceChange, accountId]
            );

            return { success: true };
        } catch (error) {
            console.error('updateAccountBalance Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Cari hesaba ait işlemleri getir
    getTransactionsByAccount: async (accountId) => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    t.id,
                    t.transaction_type,
                    t.amount,
                    t.description,
                    t.reference_number,
                    t.transaction_date,
                    t.due_date,
                    t.payment_method,
                    t.status,
                    t.created_at
                FROM transactions t
                WHERE t.account_id = ? AND t.is_active = 1
                ORDER BY t.transaction_date DESC, t.created_at DESC
            `, [accountId]);

            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('getTransactionsByAccount Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // İşlem türüne göre toplam tutarları getir
    getTransactionSummaryByType: async () => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    transaction_type,
                    COUNT(*) as transaction_count,
                    SUM(amount) as total_amount,
                    AVG(amount) as average_amount,
                    MIN(amount) as min_amount,
                    MAX(amount) as max_amount
                FROM transactions
                WHERE is_active = 1
                GROUP BY transaction_type
                ORDER BY total_amount DESC
            `);

            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('getTransactionSummaryByType Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

module.exports = Transactions;