/**
 * @fileoverview Account Groups Controller
 * @description HTTP request handlers for account group operations
 * @version 1.0.0
 */

const AccountGroups = require('../models/groupModel');

/**
 * Account Groups Controller
 * @namespace groupController
 */
const groupController = {
    
    /**
     * Get all account groups
     * @async
     * @function getAllGroups
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @route GET /api/groups
     */
    getAllGroups: async (req, res) => {
        try {
            const result = await AccountGroups.getAllGroups();
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Gruplar başarıyla getirildi',
                    data: result.data,
                    count: result.data.length
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Gruplar getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getAllGroups Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // ID'ye göre grup getir - GET /api/groups/:id
    getGroupById: async (req, res) => {
        try {
            const { id } = req.params;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz grup ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            const result = await AccountGroups.getGroupById(parseInt(id));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Grup başarıyla getirildi',
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Grup bulunamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getGroupById Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Yeni grup oluştur - POST /api/groups
    createGroup: async (req, res) => {
        try {
            const { grup_adi } = req.body;
            
            // Grup adı varlığını kontrol et
            if (!grup_adi || grup_adi.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Grup adı gereklidir',
                    error: 'grup_adi alanı boş olamaz'
                });
            }

            // Grup adı uzunluk kontrolü
            if (grup_adi.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Grup adı en az 2 karakter olmalıdır',
                    error: 'Geçersiz grup adı'
                });
            }

            if (grup_adi.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Grup adı en fazla 100 karakter olabilir',
                    error: 'Grup adı çok uzun'
                });
            }

            const result = await AccountGroups.createGroup(grup_adi.trim());
            
            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: 'Grup başarıyla oluşturuldu',
                    data: result.data
                });
            } else {
                // Duplicate error gibi durumlarda 400 Bad Request
                res.status(400).json({
                    success: false,
                    message: 'Grup oluşturulamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('createGroup Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Grubu güncelle - PUT /api/groups/:id
    updateGroup: async (req, res) => {
        try {
            const { id } = req.params;
            const { grup_adi } = req.body;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz grup ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            // Grup adı varlığını kontrol et
            if (!grup_adi || grup_adi.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Grup adı gereklidir',
                    error: 'grup_adi alanı boş olamaz'
                });
            }

            // Grup adı uzunluk kontrolü
            if (grup_adi.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Grup adı en az 2 karakter olmalıdır',
                    error: 'Geçersiz grup adı'
                });
            }

            if (grup_adi.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Grup adı en fazla 100 karakter olabilir',
                    error: 'Grup adı çok uzun'
                });
            }

            const result = await AccountGroups.updateGroup(parseInt(id), grup_adi.trim());
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Grup başarıyla güncellendi',
                    data: result.data
                });
            } else {
                // Grup bulunamadı durumunda 404
                if (result.error.includes('bulunamadı')) {
                    res.status(404).json({
                        success: false,
                        message: 'Grup bulunamadı',
                        error: result.error
                    });
                } else {
                    // Diğer durumlar 400 Bad Request
                    res.status(400).json({
                        success: false,
                        message: 'Grup güncellenemedi',
                        error: result.error
                    });
                }
            }
        } catch (error) {
            console.error('updateGroup Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Grubu sil - DELETE /api/groups/:id
    deleteGroup: async (req, res) => {
        try {
            const { id } = req.params;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz grup ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            const result = await AccountGroups.deleteGroup(parseInt(id));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Grup başarıyla silindi',
                    data: result.data
                });
            } else {
                // Grup bulunamadı durumunda 404
                if (result.error.includes('bulunamadı')) {
                    res.status(404).json({
                        success: false,
                        message: 'Grup bulunamadı',
                        error: result.error
                    });
                } else {
                    // Foreign key constraint gibi durumlar 400 Bad Request
                    res.status(400).json({
                        success: false,
                        message: 'Grup silinemedi',
                        error: result.error
                    });
                }
            }
        } catch (error) {
            console.error('deleteGroup Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Gruba bağlı hesap sayısını getir - GET /api/groups/:id/accounts/count
    getGroupAccountCount: async (req, res) => {
        try {
            const { id } = req.params;
            
            // ID validasyonu
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz grup ID\'si',
                    error: 'ID sayısal bir değer olmalıdır'
                });
            }

            const result = await AccountGroups.getGroupAccountCount(parseInt(id));
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Hesap sayısı başarıyla getirildi',
                    data: result.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Hesap sayısı getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getGroupAccountCount Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    }
};

module.exports = groupController;