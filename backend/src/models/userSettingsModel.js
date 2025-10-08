/**
 * @fileoverview User Settings Model
 * @description Database operations for user preferences and application settings
 * @version 1.0.0
 */

const db = require('../config/db');

/**
 * User Settings Model
 * @namespace UserSettings
 */
const UserSettings = {
    // Belirli bir ayar değerini getir
    getSetting: async (settingName) => {
        try {
            // Ayar adı validasyonu
            if (!settingName || settingName.trim() === '') {
                return {
                    success: false,
                    error: 'Ayar adı gereklidir'
                };
            }

            const [rows] = await db.execute(
                'SELECT setting_name, setting_value, setting_type, description, updated_at FROM user_settings WHERE setting_name = ?',
                [settingName.trim()]
            );

            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'Ayar bulunamadı'
                };
            }

            const setting = rows[0];
            
            // Değeri tipine göre dönüştür
            let parsedValue = setting.setting_value;
            
            switch (setting.setting_type) {
                case 'number':
                    parsedValue = parseFloat(setting.setting_value);
                    break;
                case 'boolean':
                    parsedValue = setting.setting_value === 'true' || setting.setting_value === '1';
                    break;
                case 'json':
                    try {
                        parsedValue = JSON.parse(setting.setting_value);
                    } catch (e) {
                        parsedValue = setting.setting_value; // JSON parse edilemezse string olarak bırak
                    }
                    break;
                case 'string':
                default:
                    parsedValue = setting.setting_value;
                    break;
            }

            return {
                success: true,
                data: {
                    setting_name: setting.setting_name,
                    setting_value: parsedValue,
                    setting_type: setting.setting_type,
                    description: setting.description,
                    updated_at: setting.updated_at
                }
            };
        } catch (error) {
            console.error('getSetting Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Ayar değerini güncelle veya oluştur
    setSetting: async (settingName, settingValue, settingType = 'string', description = null) => {
        try {
            // Ayar adı validasyonu
            if (!settingName || settingName.trim() === '') {
                return {
                    success: false,
                    error: 'Ayar adı gereklidir'
                };
            }

            // Değer validasyonu
            if (settingValue === undefined || settingValue === null) {
                return {
                    success: false,
                    error: 'Ayar değeri gereklidir'
                };
            }

            // Tip validasyonu
            const validTypes = ['string', 'number', 'boolean', 'json'];
            if (!validTypes.includes(settingType)) {
                return {
                    success: false,
                    error: 'Geçersiz ayar tipi. string, number, boolean veya json olmalıdır'
                };
            }

            // Değeri string'e dönüştür
            let stringValue;
            
            switch (settingType) {
                case 'number':
                    if (isNaN(settingValue)) {
                        return {
                            success: false,
                            error: 'Sayısal tip için geçersiz değer'
                        };
                    }
                    stringValue = String(settingValue);
                    break;
                case 'boolean':
                    stringValue = Boolean(settingValue) ? 'true' : 'false';
                    break;
                case 'json':
                    try {
                        stringValue = typeof settingValue === 'string' ? settingValue : JSON.stringify(settingValue);
                        // JSON'un geçerli olduğunu kontrol et
                        JSON.parse(stringValue);
                    } catch (e) {
                        return {
                            success: false,
                            error: 'Geçersiz JSON değeri'
                        };
                    }
                    break;
                case 'string':
                default:
                    stringValue = String(settingValue);
                    break;
            }

            // Ayar adı uzunluk kontrolü
            if (settingName.trim().length > 100) {
                return {
                    success: false,
                    error: 'Ayar adı en fazla 100 karakter olabilir'
                };
            }

            // Değer uzunluk kontrolü
            if (stringValue.length > 5000) {
                return {
                    success: false,
                    error: 'Ayar değeri en fazla 5000 karakter olabilir'
                };
            }

            // Açıklama uzunluk kontrolü (eğer belirtilmişse)
            if (description && description.length > 255) {
                return {
                    success: false,
                    error: 'Açıklama en fazla 255 karakter olabilir'
                };
            }

            // Ayarın var olup olmadığını kontrol et
            const [existingRows] = await db.execute(
                'SELECT setting_name FROM user_settings WHERE setting_name = ?',
                [settingName.trim()]
            );

            let result;

            if (existingRows.length > 0) {
                // Mevcut ayarı güncelle
                [result] = await db.execute(`
                    UPDATE user_settings 
                    SET setting_value = ?, 
                        setting_type = ?, 
                        description = COALESCE(?, description), 
                        updated_at = NOW() 
                    WHERE setting_name = ?
                `, [stringValue, settingType, description, settingName.trim()]);

                if (result.affectedRows === 0) {
                    return {
                        success: false,
                        error: 'Ayar güncellenemedi'
                    };
                }
            } else {
                // Yeni ayar oluştur
                [result] = await db.execute(`
                    INSERT INTO user_settings (setting_name, setting_value, setting_type, description, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, NOW(), NOW())
                `, [settingName.trim(), stringValue, settingType, description]);
            }

            return {
                success: true,
                data: {
                    setting_name: settingName.trim(),
                    setting_value: settingValue,
                    setting_type: settingType,
                    description: description,
                    message: existingRows.length > 0 ? 'Ayar başarıyla güncellendi' : 'Ayar başarıyla oluşturuldu'
                }
            };
        } catch (error) {
            console.error('setSetting Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Tüm ayarları getir
    getAllSettings: async () => {
        try {
            const [rows] = await db.execute(`
                SELECT setting_name, setting_value, setting_type, description, created_at, updated_at 
                FROM user_settings 
                ORDER BY setting_name ASC
            `);

            // Değerleri tipine göre dönüştür
            const settings = rows.map(setting => {
                let parsedValue = setting.setting_value;
                
                switch (setting.setting_type) {
                    case 'number':
                        parsedValue = parseFloat(setting.setting_value);
                        break;
                    case 'boolean':
                        parsedValue = setting.setting_value === 'true' || setting.setting_value === '1';
                        break;
                    case 'json':
                        try {
                            parsedValue = JSON.parse(setting.setting_value);
                        } catch (e) {
                            parsedValue = setting.setting_value;
                        }
                        break;
                    case 'string':
                    default:
                        parsedValue = setting.setting_value;
                        break;
                }

                return {
                    setting_name: setting.setting_name,
                    setting_value: parsedValue,
                    setting_type: setting.setting_type,
                    description: setting.description,
                    created_at: setting.created_at,
                    updated_at: setting.updated_at
                };
            });

            return {
                success: true,
                data: settings
            };
        } catch (error) {
            console.error('getAllSettings Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Belirli bir ayarı sil
    deleteSetting: async (settingName) => {
        try {
            if (!settingName || settingName.trim() === '') {
                return {
                    success: false,
                    error: 'Ayar adı gereklidir'
                };
            }

            // Ayarın var olup olmadığını kontrol et
            const [existingRows] = await db.execute(
                'SELECT setting_name FROM user_settings WHERE setting_name = ?',
                [settingName.trim()]
            );

            if (existingRows.length === 0) {
                return {
                    success: false,
                    error: 'Ayar bulunamadı'
                };
            }

            const [result] = await db.execute(
                'DELETE FROM user_settings WHERE setting_name = ?',
                [settingName.trim()]
            );

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Ayar silinemedi'
                };
            }

            return {
                success: true,
                data: {
                    message: 'Ayar başarıyla silindi'
                }
            };
        } catch (error) {
            console.error('deleteSetting Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Varsayılan ayarları oluştur
    initializeDefaultSettings: async () => {
        try {
            const defaultSettings = [
                {
                    name: 'app_name',
                    value: 'Cari Takip Uygulaması',
                    type: 'string',
                    description: 'Uygulama adı'
                },
                {
                    name: 'currency',
                    value: 'TRY',
                    type: 'string',
                    description: 'Ana para birimi'
                },
                {
                    name: 'date_format',
                    value: 'DD/MM/YYYY',
                    type: 'string',
                    description: 'Tarih formatı'
                },
                {
                    name: 'decimal_places',
                    value: 2,
                    type: 'number',
                    description: 'Para birimi ondalık basamak sayısı'
                },
                {
                    name: 'auto_backup',
                    value: true,
                    type: 'boolean',
                    description: 'Otomatik yedekleme aktif mi'
                },
                {
                    name: 'backup_frequency',
                    value: 7,
                    type: 'number',
                    description: 'Yedekleme sıklığı (gün)'
                },
                {
                    name: 'email_notifications',
                    value: false,
                    type: 'boolean',
                    description: 'Email bildirimleri aktif mi'
                },
                {
                    name: 'theme_settings',
                    value: {
                        theme: 'light',
                        primaryColor: '#2563eb',
                        fontSize: 'medium'
                    },
                    type: 'json',
                    description: 'Tema ayarları'
                },
                {
                    name: 'report_settings',
                    value: {
                        defaultPeriod: 'monthly',
                        includeZeroBalances: false,
                        groupByCategory: true
                    },
                    type: 'json',
                    description: 'Rapor varsayılan ayarları'
                }
            ];

            let createdCount = 0;

            for (const setting of defaultSettings) {
                const result = await UserSettings.setSetting(
                    setting.name,
                    setting.value,
                    setting.type,
                    setting.description
                );

                if (result.success) {
                    createdCount++;
                }
            }

            return {
                success: true,
                data: {
                    message: `${createdCount} varsayılan ayar oluşturuldu/güncellendi`,
                    createdCount: createdCount,
                    totalSettings: defaultSettings.length
                }
            };
        } catch (error) {
            console.error('initializeDefaultSettings Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Ayarları kategoriye göre getir
    getSettingsByCategory: async (category) => {
        try {
            if (!category || category.trim() === '') {
                return {
                    success: false,
                    error: 'Kategori adı gereklidir'
                };
            }

            const [rows] = await db.execute(`
                SELECT setting_name, setting_value, setting_type, description, updated_at 
                FROM user_settings 
                WHERE setting_name LIKE ?
                ORDER BY setting_name ASC
            `, [`${category.trim()}_%`]);

            // Değerleri tipine göre dönüştür
            const settings = rows.map(setting => {
                let parsedValue = setting.setting_value;
                
                switch (setting.setting_type) {
                    case 'number':
                        parsedValue = parseFloat(setting.setting_value);
                        break;
                    case 'boolean':
                        parsedValue = setting.setting_value === 'true' || setting.setting_value === '1';
                        break;
                    case 'json':
                        try {
                            parsedValue = JSON.parse(setting.setting_value);
                        } catch (e) {
                            parsedValue = setting.setting_value;
                        }
                        break;
                    case 'string':
                    default:
                        parsedValue = setting.setting_value;
                        break;
                }

                return {
                    setting_name: setting.setting_name,
                    setting_value: parsedValue,
                    setting_type: setting.setting_type,
                    description: setting.description,
                    updated_at: setting.updated_at
                };
            });

            return {
                success: true,
                data: settings,
                category: category.trim()
            };
        } catch (error) {
            console.error('getSettingsByCategory Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

module.exports = UserSettings;