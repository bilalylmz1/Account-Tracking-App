/**
 * @fileoverview Account Groups Model
 * @description Database operations for account group management
 * @version 1.0.0
 */

const db = require('../config/db');

/**
 * Account Groups Model
 * @namespace AccountGroups
 */
const AccountGroups = {
    
    /**
     * Retrieve all account groups
     * @async
     * @function getAllGroups
     * @returns {Promise<Object>} Result object with success status and data/error
     */
    getAllGroups: async () => {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM account_groups ORDER BY group_name ASC'
            );
            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('getAllGroups Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Retrieve account group by ID
     * @async
     * @function getGroupById
     * @param {number} id - Group ID
     * @returns {Promise<Object>} Result object with success status and data/error
     */
    getGroupById: async (id) => {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM account_groups WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'Grup bulunamadı'
                };
            }

            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('getGroupById Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Yeni grup oluştur
    createGroup: async (groupName) => {
        try {
            // Aynı isimde grup var mı kontrol et
            const [existingRows] = await db.execute(
                'SELECT id FROM account_groups WHERE group_name = ?',
                [groupName]
            );

            if (existingRows.length > 0) {
                return {
                    success: false,
                    error: 'Bu isimde bir grup zaten mevcut'
                };
            }

            const [result] = await db.execute(
                'INSERT INTO account_groups (group_name, created_at, updated_at) VALUES (?, NOW(), NOW())',
                [groupName]
            );

            return {
                success: true,
                data: {
                    id: result.insertId,
                    group_name: groupName,
                    message: 'Grup başarıyla oluşturuldu'
                }
            };
        } catch (error) {
            console.error('createGroup Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Grubu güncelle
    updateGroup: async (id, groupName) => {
        try {
            // Grup var mı kontrol et
            const existingGroup = await AccountGroups.getGroupById(id);
            if (!existingGroup.success) {
                return existingGroup;
            }

            // Aynı isimde başka grup var mı kontrol et (kendisi hariç)
            const [existingRows] = await db.execute(
                'SELECT id FROM account_groups WHERE group_name = ? AND id != ?',
                [groupName, id]
            );

            if (existingRows.length > 0) {
                return {
                    success: false,
                    error: 'Bu isimde başka bir grup zaten mevcut'
                };
            }

            const [result] = await db.execute(
                'UPDATE account_groups SET group_name = ?, updated_at = NOW() WHERE id = ?',
                [groupName, id]
            );

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Grup güncellenemedi'
                };
            }

            return {
                success: true,
                data: {
                    id: parseInt(id),
                    group_name: groupName,
                    message: 'Grup başarıyla güncellendi'
                }
            };
        } catch (error) {
            console.error('updateGroup Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Grubu sil
    deleteGroup: async (id) => {
        try {
            // Grup var mı kontrol et
            const existingGroup = await AccountGroups.getGroupById(id);
            if (!existingGroup.success) {
                return existingGroup;
            }

            // Bu gruba bağlı hesap var mı kontrol et
            const [linkedAccounts] = await db.execute(
                'SELECT COUNT(*) as count FROM accounts WHERE group_id = ?',
                [id]
            );

            if (linkedAccounts[0].count > 0) {
                return {
                    success: false,
                    error: `Bu gruba bağlı ${linkedAccounts[0].count} hesap bulunduğu için silinemez`
                };
            }

            const [result] = await db.execute(
                'DELETE FROM account_groups WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Grup silinemedi'
                };
            }

            return {
                success: true,
                data: {
                    message: 'Grup başarıyla silindi'
                }
            };
        } catch (error) {
            console.error('deleteGroup Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Gruba bağlı hesap sayısını getir
    getGroupAccountCount: async (id) => {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as account_count FROM accounts WHERE group_id = ?',
                [id]
            );

            return {
                success: true,
                data: {
                    group_id: parseInt(id),
                    account_count: rows[0].account_count
                }
            };
        } catch (error) {
            console.error('getGroupAccountCount Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

module.exports = AccountGroups;