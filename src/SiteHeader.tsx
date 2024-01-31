import {
  AppBar,
  Toolbar,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'

type Step = 'map' | 'factory'

type SiteHeaderProps = {
  currentStep: Step
  onStepChangeRequest?: (step: Step) => unknown
}

export function SiteHeader({
  currentStep,
  onStepChangeRequest,
}: SiteHeaderProps) {
  const steps = ['map', 'factory']
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Map factory</Typography>
        <Stepper activeStep={steps.indexOf(currentStep)}>
          <Step onClick={() => onStepChangeRequest?.('map')}>
            <StepLabel>Select capture area</StepLabel>
          </Step>
          <Step>
            <StepLabel>Download map</StepLabel>
          </Step>
        </Stepper>
      </Toolbar>
    </AppBar>
  )
}
