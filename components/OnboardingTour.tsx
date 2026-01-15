import React, { useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useToast } from './Toast';

interface OnboardingTourProps {
  runTour: boolean;
  stepIndex: number;
  setStepIndex: (index: number) => void;
  onTourFinish: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ runTour, stepIndex, setStepIndex, onTourFinish }) => {
  const { showToast } = useToast();
  const [steps] = useState<Step[]>([
    {
      target: '#sidebar-create-template-btn',
      content: 'Start by creating a new interview template.',
      disableBeacon: true,
      spotlightClicks: true,
      styles: {
        buttonNext: {
          display: 'none',
        },
      },
    },
    {
      target: '#editor-category-input',
      content: 'Type a name for your first category here (e.g., "React Basics").',
      disableBeacon: true,
    },
    {
      target: '#editor-add-category-btn',
      content: 'Click here to add the category to your template.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.last-category .editor-add-question-btn',
      content: 'Great! now click here to add a new question to this category.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.editor-question-textarea',
      content: 'Type your question text here (e.g., "What is a React Component?").',
      disableBeacon: true,
    },
    {
      target: '#editor-start-interview-btn',
      content: 'Perfect! Once your template is ready, click here to start the interview session.',
      disableBeacon: true,
      spotlightClicks: true,
    },
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onTourFinish();
      showToast('Onboarding completed!', 'success');
    } else if (type === 'step:after' && action === 'next') {
        setStepIndex(index + 1);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      hideCloseButton
      hideBackButton
      disableOverlayClose
      spotlightClicks
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#144346',
          zIndex: 1000,
        },
      }}
    />
  );
};
