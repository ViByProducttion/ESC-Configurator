/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import './style.scss';

const STORAGE_KEY = 'esc_profiles_data';

const ProfileSystem = ({ currentSettings, onApplyProfile }) => {
    const [profiles, setProfiles] = useState({});
    const [selectedProfile, setSelectedProfile] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        scanProfiles();
        window.addEventListener('storage', scanProfiles);
        return () => window.removeEventListener('storage', scanProfiles);
    }, []);

    const scanProfiles = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                setProfiles(parsed);
                if (!selectedProfile && Object.keys(parsed).length > 0) {
                    setSelectedProfile(Object.keys(parsed)[0]);
                }
            }
        } catch (e) {
            console.error('Ошибка чтения профилей', e);
        }
    };

    const saveToStorage = (newProfiles) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
        setProfiles(newProfiles);
    };

    const handleSelectChange = (e) => {
        const name = e.target.value;
        setSelectedProfile(name);
        if (profiles[name]) {
            onApplyProfile(profiles[name]);
        }
    };

    // Обновленная функция: Сохраняет в память И сразу скачивает файл на диск
    const handleCreate = () => {
        const name = prompt('Введите имя нового профиля:');
        if (name && name.trim()) {
            const profileName = name.trim();
            
            // 1. Сохраняем в список программы (внутренняя память)
            const newProfiles = { ...profiles, [profileName]: currentSettings };
            saveToStorage(newProfiles);
            setSelectedProfile(profileName);

            // 2. Автоматически скачиваем физический файл .profile на компьютер
            const dataStr = JSON.stringify(currentSettings, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${profileName}.profile`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleSave = () => {
        if (!selectedProfile) return;
        if (window.confirm(`Перезаписать профиль "${selectedProfile}" текущими настройками?`)) {
            const newProfiles = { ...profiles, [selectedProfile]: currentSettings };
            saveToStorage(newProfiles);
            alert('Настройки сохранены в профиль!');
        }
    };

    const handleDelete = () => {
        if (!selectedProfile) return;
        if (window.confirm(`Удалить профиль "${selectedProfile}"?`)) {
            const newProfiles = { ...profiles };
            delete newProfiles[selectedProfile];
            saveToStorage(newProfiles);
            const remaining = Object.keys(newProfiles);
            setSelectedProfile(remaining.length > 0 ? remaining[0] : '');
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedSettings = JSON.parse(event.target.result);
                let name = file.name.replace('.profile', '');
                
                if (profiles[name]) {
                    name = `${name}_imported_${Date.now()}`;
                }

                const newProfiles = { ...profiles, [name]: importedSettings };
                saveToStorage(newProfiles);
                setSelectedProfile(name);
                
                // Применяем настройки
                onApplyProfile(importedSettings);
            } catch (err) {
                alert('Ошибка чтения файла профиля!');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    };

    return (
        <div className="profile-system-container">
            <select 
                value={selectedProfile} 
                onChange={handleSelectChange}
                className="profile-select"
            >
                <option value="" disabled>Выберите профиль...</option>
                {Object.keys(profiles).map(name => (
                    <option key={name} value={name}>{name}</option>
                ))}
            </select>

            <button title="Создать новый и скачать файл" onClick={handleCreate}>📝</button>
            <button title="Сохранить в текущий" onClick={handleSave} disabled={!selectedProfile}>💾</button>
            <button title="Удалить профиль" onClick={handleDelete} disabled={!selectedProfile}>❌</button>
            
            <div className="profile-divider">|</div>
            
            {/* Кнопка экспорта удалена, остался только импорт */}
            <button title="Импорт профиля из файла" onClick={() => fileInputRef.current.click()}>📥</button>
            <input 
                type="file" 
                accept=".profile" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImport} 
            />
        </div>
    );
};

export default ProfileSystem;