import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Info, Shield, Save, FileText, CheckCircle } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Info size={48} style={{ color: 'var(--accent-blue)' }} />,
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.description'),
    },
    {
      icon: <FileText size={48} style={{ color: 'var(--accent-green)' }} />,
      title: t('onboarding.whatIsHosts.title'),
      description: t('onboarding.whatIsHosts.description'),
    },
    {
      icon: <Shield size={48} style={{ color: 'var(--accent-orange)' }} />,
      title: t('onboarding.adminRequired.title'),
      description: t('onboarding.adminRequired.description'),
    },
    {
      icon: <Save size={48} style={{ color: 'var(--accent-purple)' }} />,
      title: t('onboarding.autoBackup.title'),
      description: t('onboarding.autoBackup.description'),
    },
    {
      icon: <CheckCircle size={48} style={{ color: 'var(--success-color)' }} />,
      title: t('onboarding.ready.title'),
      description: t('onboarding.ready.description'),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboardingCompleted', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            {step.icon}
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{step.title}</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
            {step.description}
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '24px 0' }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === currentStep ? 'var(--accent-blue)' : 'var(--border-color)',
                transition: 'var(--transition)',
              }}
            />
          ))}
        </div>

        <div className="modal-actions">
          {currentStep > 0 && (
            <button
              className="btn-secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              {t('onboarding.back')}
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button className="btn-secondary" onClick={handleSkip}>
              {t('onboarding.skip')}
            </button>
          )}
          <button className="btn-primary" onClick={handleNext}>
            {currentStep === steps.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          </button>
        </div>
      </div>
    </div>
  );
};
