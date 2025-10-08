/**
 * @fileoverview Accounts Model
 * @description Database operations for customer account management
 * @version 1.0.0
 */

const db = require('../config/db');

/**
 * Customer Accounts Model
 * @namespace Accounts
 */
const Accounts = {
    // Tüm cari hesapları grup adlarıyla birlikte getir
    getAllAccounts: async () => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    a.id,
                    a.account_name,
                    a.account_code,
                    a.group_id,
                    ag.group_name,
                    a.phone,
                    a.email,
                    a.address,
                    a.tax_number,
                    a.tax_office,
                    a.balance,
                    a.account_type,
                    a.is_active,
                    a.created_at,
                    a.updated_at
                FROM accounts a
                LEFT JOIN account_groups ag ON a.group_id = ag.id
                WHERE a.is_active = 1
                ORDER BY a.account_name ASC
            `);
            
            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('getAllAccounts Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // ID'ye göre cari hesap getir (grup adıyla birlikte)
    getAccountById: async (id) => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    a.id,
                    a.account_name,
                    a.account_code,
                    a.group_id,
                    ag.group_name,
                    a.phone,
                    a.email,
                    a.address,
                    a.tax_number,
                    a.tax_office,
                    a.balance,
                    a.account_type,
                    a.is_active,
                    a.created_at,
                    a.updated_at
                FROM accounts a
                LEFT JOIN account_groups ag ON a.group_id = ag.id
                WHERE a.id = ? AND a.is_active = 1
            `, [id]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'Cari hesap bulunamadı'
                };
            }

            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('getAccountById Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Yeni cari hesap oluştur
    createAccount: async (data) => {
        try {
            const {
                account_name,
                account_code,
                group_id,
                phone = null,
                email = null,
                address = null,
                tax_number = null,
                tax_office = null,
                balance = 0,
                account_type = 'customer' // customer, supplier, both
            } = data;

            // Zorunlu alanları kontrol et
            if (!account_name || account_name.trim() === '') {
                return {
                    success: false,
                    error: 'Cari hesap adı gereklidir'
                };
            }

            // Cari kodu benzersizlik kontrolü
            if (account_code) {
                const [existingCode] = await db.execute(
                    'SELECT id FROM accounts WHERE account_code = ? AND is_active = 1',
                    [account_code]
                );

                if (existingCode.length > 0) {
                    return {
                        success: false,
                        error: 'Bu cari kodu zaten kullanılıyor'
                    };
                }
            }

            // Cari adı benzersizlik kontrolü
            const [existingName] = await db.execute(
                'SELECT id FROM accounts WHERE account_name = ? AND is_active = 1',
                [account_name.trim()]
            );

            if (existingName.length > 0) {
                return {
                    success: false,
                    error: 'Bu cari hesap adı zaten mevcut'
                };
            }

            // Grup ID kontrolü (eğer belirtilmişse)
            if (group_id) {
                const [groupExists] = await db.execute(
                    'SELECT id FROM account_groups WHERE id = ?',
                    [group_id]
                );

                if (groupExists.length === 0) {
                    return {
                        success: false,
                        error: 'Belirtilen grup bulunamadı'
                    };
                }
            }

            // Email format kontrolü (eğer belirtilmişse)
            if (email && email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return {
                        success: false,
                        error: 'Geçersiz email formatı'
                    };
                }
            }

            const [result] = await db.execute(`
                INSERT INTO accounts (
                    account_name, account_code, group_id, phone, email, 
                    address, tax_number, tax_office, balance, account_type, 
                    is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
            `, [
                account_name.trim(),
                account_code || null,
                group_id || null,
                phone || null,
                email ? email.trim() : null,
                address || null,
                tax_number || null,
                tax_office || null,
                parseFloat(balance) || 0,
                account_type
            ]);

            return {
                success: true,
                data: {
                    id: result.insertId,
                    account_name: account_name.trim(),
                    account_code: account_code || null,
                    message: 'Cari hesap başarıyla oluşturuldu'
                }
            };
        } catch (error) {
            console.error('createAccount Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Cari hesabı güncelle
    updateAccount: async (id, data) => {
        try {
            // Hesap var mı kontrol et
            const existingAccount = await Accounts.getAccountById(id);
            if (!existingAccount.success) {
                return existingAccount;
            }

            const {
                account_name,
                account_code,
                group_id,
                phone,
                email,
                address,
                tax_number,
                tax_office,
                balance,
                account_type
            } = data;

            // Zorunlu alanları kontrol et
            if (!account_name || account_name.trim() === '') {
                return {
                    success: false,
                    error: 'Cari hesap adı gereklidir'
                };
            }

            // Cari kodu benzersizlik kontrolü (kendisi hariç)
            if (account_code) {
                const [existingCode] = await db.execute(
                    'SELECT id FROM accounts WHERE account_code = ? AND id != ? AND is_active = 1',
                    [account_code, id]
                );

                if (existingCode.length > 0) {
                    return {
                        success: false,
                        error: 'Bu cari kodu başka bir hesap tarafından kullanılıyor'
                    };
                }
            }

            // Cari adı benzersizlik kontrolü (kendisi hariç)
            const [existingName] = await db.execute(
                'SELECT id FROM accounts WHERE account_name = ? AND id != ? AND is_active = 1',
                [account_name.trim(), id]
            );

            if (existingName.length > 0) {
                return {
                    success: false,
                    error: 'Bu cari hesap adı başka bir hesap tarafından kullanılıyor'
                };
            }

            // Grup ID kontrolü (eğer belirtilmişse)
            if (group_id) {
                const [groupExists] = await db.execute(
                    'SELECT id FROM account_groups WHERE id = ?',
                    [group_id]
                );

                if (groupExists.length === 0) {
                    return {
                        success: false,
                        error: 'Belirtilen grup bulunamadı'
                    };
                }
            }

            // Email format kontrolü (eğer belirtilmişse)
            if (email && email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return {
                        success: false,
                        error: 'Geçersiz email formatı'
                    };
                }
            }

            const [result] = await db.execute(`
                UPDATE accounts SET 
                    account_name = ?, 
                    account_code = ?, 
                    group_id = ?, 
                    phone = ?, 
                    email = ?, 
                    address = ?, 
                    tax_number = ?, 
                    tax_office = ?, 
                    balance = ?, 
                    account_type = ?,
                    updated_at = NOW()
                WHERE id = ? AND is_active = 1
            `, [
                account_name.trim(),
                account_code || null,
                group_id || null,
                phone || null,
                email ? email.trim() : null,
                address || null,
                tax_number || null,
                tax_office || null,
                parseFloat(balance) || existingAccount.data.balance,
                account_type || existingAccount.data.account_type,
                id
            ]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Cari hesap güncellenemedi'
                };
            }

            return {
                success: true,
                data: {
                    id: parseInt(id),
                    account_name: account_name.trim(),
                    account_code: account_code || null,
                    message: 'Cari hesap başarıyla güncellendi'
                }
            };
        } catch (error) {
            console.error('updateAccount Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Cari hesabı sil (soft delete)
    deleteAccount: async (id) => {
        try {
            // Hesap var mı kontrol et
            const existingAccount = await Accounts.getAccountById(id);
            if (!existingAccount.success) {
                return existingAccount;
            }

            // Bu hesaba bağlı işlemler var mı kontrol et (örnek: faturalar, ödemeler)
            const [linkedTransactions] = await db.execute(
                `SELECT COUNT(*) as count FROM (
                    SELECT id FROM invoices WHERE customer_id = ? 
                    UNION ALL 
                    SELECT id FROM payments WHERE account_id = ?
                ) as transactions`,
                [id, id]
            );

            if (linkedTransactions[0].count > 0) {
                return {
                    success: false,
                    error: `Bu cari hesaba bağlı ${linkedTransactions[0].count} işlem bulunduğu için silinemez`
                };
            }

            // Soft delete - is_active = 0
            const [result] = await db.execute(
                'UPDATE accounts SET is_active = 0, updated_at = NOW() WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Cari hesap silinemedi'
                };
            }

            return {
                success: true,
                data: {
                    message: 'Cari hesap başarıyla silindi'
                }
            };
        } catch (error) {
            console.error('deleteAccount Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Cari hesap türüne göre filtrele
    getAccountsByType: async (accountType) => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    a.id,
                    a.account_name,
                    a.account_code,
                    a.group_id,
                    ag.group_name,
                    a.phone,
                    a.email,
                    a.balance,
                    a.account_type,
                    a.created_at
                FROM accounts a
                LEFT JOIN account_groups ag ON a.group_id = ag.id
                WHERE a.account_type = ? AND a.is_active = 1
                ORDER BY a.account_name ASC
            `, [accountType]);

            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('getAccountsByType Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Gruba göre cari hesapları getir
    getAccountsByGroup: async (groupId) => {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    a.id,
                    a.account_name,
                    a.account_code,
                    a.group_id,
                    ag.group_name,
                    a.balance,
                    a.account_type,
                    a.created_at
                FROM accounts a
                LEFT JOIN account_groups ag ON a.group_id = ag.id
                WHERE a.group_id = ? AND a.is_active = 1
                ORDER BY a.account_name ASC
            `, [groupId]);

            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('getAccountsByGroup Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Cari hesap arama
    searchAccounts: async (searchTerm) => {
        try {
            const searchPattern = `%${searchTerm}%`;
            const [rows] = await db.execute(`
                SELECT 
                    a.id,
                    a.account_name,
                    a.account_code,
                    a.group_id,
                    ag.group_name,
                    a.phone,
                    a.email,
                    a.balance,
                    a.account_type
                FROM accounts a
                LEFT JOIN account_groups ag ON a.group_id = ag.id
                WHERE (a.account_name LIKE ? 
                    OR a.account_code LIKE ? 
                    OR a.phone LIKE ? 
                    OR a.email LIKE ?) 
                AND a.is_active = 1
                ORDER BY a.account_name ASC
            `, [searchPattern, searchPattern, searchPattern, searchPattern]);

            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('searchAccounts Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

module.exports = Accounts;