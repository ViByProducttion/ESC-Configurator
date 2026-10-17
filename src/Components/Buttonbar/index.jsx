/* eslint-disable */
import React, { useCallback, useMemo } from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import GenericButton from './GenericButton';
import ProfileSystem from '../ProfileSystem';

import {
  prod,
  show,
  selectSupported,
} from '../MelodyEditor/melodiesSlice';
import {
  clear as clearLog,
  selectLog,
} from '../Log/logSlice';
import {
  selectCanFlash,
  selectCanRead,
  selectCanWrite,
  setSelecting,
} from '../../Containers/App/stateSlice';

// ДОБАВИЛИ ИМПОРТ selectMaster и setMaster
import {
  selectIndividual,
  selectMaster,
  setTargets,
  setIndividual,
  setMaster,
} from '../../Containers/App/escsSlice';

import './style.scss';

function Buttonbar({
  onReadSetup,
  onWriteSetup,
  onResetDefaults,
}) {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const showMelodyEditor = useSelector(selectSupported);
  const log = useSelector(selectLog);

  const canFlash = useSelector(selectCanFlash);
  const canRead = useSelector(selectCanRead);
  const canWrite = useSelector(selectCanWrite);

  // Считываем ОБЕ группы параметров программы
  const individual = useSelector(selectIndividual);
  const master = useSelector(selectMaster);

  // Объединяем их в один "Пакет настроек" для профиля
  const currentSettings = useMemo(() => ({
    master,
    individual
  }), [master, individual]);

  const onSeletFirmwareForAll = useCallback(() => {
    const targets = [];
    for (let i = 0; i < individual.length; i += 1) {
      const esc = individual[i];
      targets.push(esc.index);
    }

    dispatch(setSelecting(true));
    dispatch(setTargets(targets));
  }, [dispatch, individual]);

  const handleOpenMelodyEditor = useCallback(() => {
    dispatch(prod());
    dispatch(show());
  }, [dispatch]);

  const handleSaveLog = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob([log.join("\n")], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "esc-configurator-log.txt";
    document.body.appendChild(element);
    element.click();

    dispatch(clearLog());
  }, [dispatch, log]);

  const handleClearLog = useCallback(() => {
    dispatch(clearLog());
  }, [dispatch]);

  // ПРИМЕНЕНИЕ ПРОФИЛЯ (Теперь обновляет и левую, и правую часть экрана)
  const handleApplyProfile = useCallback((profileData) => {
    if (!profileData) return;
    
    // Проверяем, содержит ли профиль обе группы настроек
    if (profileData.master && profileData.individual) {
      dispatch(setMaster(profileData.master)); // Обновляем ползунки слева
      dispatch(setIndividual(profileData.individual)); // Обновляем списки справа
    } else if (Array.isArray(profileData)) {
      // Для совместимости со старыми тестовыми профилями (где были только 4 списка)
      dispatch(setIndividual(profileData));
    }
  }, [dispatch]);

  return (
    <div className="button-bar">
      <div className="buttons-bottom mobile-show">
        {showMelodyEditor &&
          <GenericButton
            disabled={!canRead}
            onClick={handleOpenMelodyEditor}
            text={t('escButtonOpenMelodyEditor')}
          />}
      </div>

      <div className="buttons-left">
        <GenericButton
          onClick={handleSaveLog}
          text={t('escButtonSaveLog')}
        />

        <GenericButton
          onClick={handleClearLog}
          text={t('escButtonClearLog')}
        />

        <div className="profile-system-wrapper" style={{ marginLeft: '15px', display: 'flex' }}>
          {/* Передаем ПОЛНЫЕ параметры в систему профилей */}
          <ProfileSystem 
            currentSettings={currentSettings} 
            onApplyProfile={handleApplyProfile} 
          />
        </div>

        <div className="mobile-show">
          <GenericButton
            disabled={!canWrite}
            onClick={onResetDefaults}
            text={t('resetDefaults')}
          />
        </div>
      </div>

      <div className="buttons-right">
        <GenericButton
          disabled={!canRead}
          onClick={onReadSetup}
          text={t('escButtonRead')}
        />

        <GenericButton
          disabled={!canWrite}
          onClick={onWriteSetup}
          text={t('escButtonWrite')}
        />

        <GenericButton
          disabled={!canFlash}
          onClick={onSeletFirmwareForAll}
          text={t('escButtonFlashAll')}
        />

        <GenericButton
          disabled={!canWrite}
          onClick={onResetDefaults}
          text={t('resetDefaults')}
        />

        {showMelodyEditor &&
          <GenericButton
            disabled={!canRead}
            onClick={handleOpenMelodyEditor}
            text={t('escButtonOpenMelodyEditor')}
          />}
      </div>
    </div>
  );
}

Buttonbar.propTypes = {
  onReadSetup: PropTypes.func.isRequired,
  onResetDefaults: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
};

export default Buttonbar;