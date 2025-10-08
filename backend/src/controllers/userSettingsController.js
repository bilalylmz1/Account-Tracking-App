/**
 * @fileoverview User Settings Controller
 * @description HTTP request handlers for user settings and preferences
 * @version 1.0.0
 */

const UserSettings = require('../models/userSettingsModel');

/**
 * User Settings Controller
 * @namespace userSettingsController
 */
const userSettingsController = {
    // Belirli bir ayarı getir - GET /api/settings/:settingName
    getSetting: async (req, res) => {
        try {
            const { settingName } = req.params;
            
            // Setting name validasyonu
            if (!settingName || settingName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Ayar adı gereklidir',
                    error: 'settingName parametresi boş olamaz'
                });
            }

            // Ayar adı uzunluk kontrolü
            if (settingName.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Ayar adı çok uzun',
                    error: 'Ayar adı en fazla 100 karakter olabilir'
                });
            }

            const result = await UserSettings.getSetting(settingName.trim());
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Ayar başarıyla getirildi',
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Ayar bulunamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getSetting Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Ayar güncelle veya oluştur - PUT /api/settings/:settingName
    setSetting: async (req, res) => {
        try {
            const { settingName } = req.params;
            const { setting_value, setting_type = 'string', description } = req.body;
            
            // Setting name validasyonu
            if (!settingName || settingName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Ayar adı gereklidir',
                    error: 'settingName parametresi boş olamaz'
                });
            }

            // Setting value validasyonu
            if (setting_value === undefined || setting_value === null) {
                return res.status(400).json({
                    success: false,
                    message: 'Ayar değeri gereklidir',
                    error: 'setting_value alanı boş olamaz'
                });
            }

            // Ayar adı uzunluk kontrolü
            if (settingName.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Ayar adı çok uzun',
                    error: 'Ayar adı en fazla 100 karakter olabilir'
                });
            }

            // Setting type validasyonu
            const validTypes = ['string', 'number', 'boolean', 'json'];
            if (!validTypes.includes(setting_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz ayar tipi',
                    error: 'setting_type string, number, boolean veya json olmalıdır'
                });
            }

            // Description uzunluk kontrolü (eğer belirtilmişse)
            if (description && description.length > 255) {
                return res.status(400).json({
                    success: false,
                    message: 'Açıklama çok uzun',
                    error: 'Açıklama en fazla 255 karakter olabilir'
                });
            }

            // Özel validasyonlar
            if (setting_type === 'number' && isNaN(setting_value)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz sayısal değer',
                    error: 'number tipi için sayısal bir değer girilmelidir'
                });
            }

            if (setting_type === 'json') {
                try {
                    if (typeof setting_value === 'string') {
                        JSON.parse(setting_value);
                    }
                } catch (e) {
                    return res.status(400).json({
                        success: false,
                        message: 'Geçersiz JSON değeri',
                        error: 'JSON tipi için geçerli bir JSON formatı girilmelidir'
                    });
                }
            }

            const result = await UserSettings.setSetting(
                settingName.trim(),
                setting_value,
                setting_type,
                description?.trim() || null
            );
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.data.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Ayar kaydedilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('setSetting Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Tüm ayarları getir - GET /api/settings
    getAllSettings: async (req, res) => {
        try {
            const result = await UserSettings.getAllSettings();
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Ayarlar başarıyla getirildi',
                    data: result.data,
                    count: result.data.length
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Ayarlar getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getAllSettings Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Ayarı sil - DELETE /api/settings/:settingName
    deleteSetting: async (req, res) => {
        try {
            const { settingName } = req.params;
            
            // Setting name validasyonu
            if (!settingName || settingName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Ayar adı gereklidir',
                    error: 'settingName parametresi boş olamaz'
                });
            }

            const result = await UserSettings.deleteSetting(settingName.trim());
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Ayar başarıyla silindi',
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Ayar bulunamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('deleteSetting Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Varsayılan ayarları oluştur - POST /api/settings/initialize
    initializeDefaultSettings: async (req, res) => {
        try {
            const result = await UserSettings.initializeDefaultSettings();
            
            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: result.data.message,
                    data: result.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Varsayılan ayarlar oluşturulamadı',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('initializeDefaultSettings Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Kategoriye göre ayarları getir - GET /api/settings/category/:category
    getSettingsByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            
            // Kategori validasyonu
            if (!category || category.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Kategori adı gereklidir',
                    error: 'category parametresi boş olamaz'
                });
            }

            // Kategori adı uzunluk kontrolü
            if (category.trim().length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Kategori adı çok uzun',
                    error: 'Kategori adı en fazla 50 karakter olabilir'
                });
            }

            const result = await UserSettings.getSettingsByCategory(category.trim());
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: `${result.category} kategorisindeki ayarlar başarıyla getirildi`,
                    data: result.data,
                    count: result.data.length,
                    category: result.category
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Kategori ayarları getirilemedi',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('getSettingsByCategory Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    },

    // Çoklu ayar güncelleme - POST /api/settings/bulk
    setBulkSettings: async (req, res) => {
        try {
            const { settings } = req.body;
            
            // Settings validasyonu
            if (!settings || !Array.isArray(settings)) {
                return res.status(400).json({
                    success: false,
                    message: 'Ayarlar listesi gereklidir',
                    error: 'settings alanı bir dizi olmalıdır'
                });
            }

            if (settings.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'En az bir ayar girilmelidir',
                    error: 'settings dizisi boş olamaz'
                });
            }

            if (settings.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Çok fazla ayar',
                    error: 'Tek seferde en fazla 50 ayar güncellenebilir'
                });
            }

            const results = [];
            let successCount = 0;
            let errorCount = 0;

            // Her ayarı tek tek işle
            for (let i = 0; i < settings.length; i++) {
                const setting = settings[i];
                
                // Ayar yapısını kontrol et
                if (!setting.setting_name || setting.setting_value === undefined || setting.setting_value === null) {
                    results.push({
                        index: i,
                        setting_name: setting.setting_name || 'unknown',
                        success: false,
                        error: 'setting_name ve setting_value gereklidir'
                    });
                    errorCount++;
                    continue;
                }

                const result = await UserSettings.setSetting(
                    setting.setting_name,
                    setting.setting_value,
                    setting.setting_type || 'string',
                    setting.description || null
                );

                results.push({
                    index: i,
                    setting_name: setting.setting_name,
                    success: result.success,
                    message: result.success ? result.data.message : result.error,
                    error: result.success ? null : result.error
                });

                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            const responseStatus = errorCount > 0 ? (successCount > 0 ? 207 : 400) : 200;

            res.status(responseStatus).json({
                success: errorCount === 0,
                message: `${successCount} ayar başarıyla güncellendi, ${errorCount} ayar başarısız`,
                data: {
                    total: settings.length,
                    success: successCount,
                    failed: errorCount,
                    results: results
                }
            });
        } catch (error) {
            console.error('setBulkSettings Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası',
                error: error.message
            });
        }
    }
};

module.exports = userSettingsController;