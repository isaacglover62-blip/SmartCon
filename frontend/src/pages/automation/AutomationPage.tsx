import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Switch, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, IconButton, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, CircularProgress,
} from '@mui/material'
import { Add, Delete, AutoFixHigh, AccessTime, DeviceHub, Bluetooth } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

interface Automation {
  id: string
  name: string
  triggerType: string
  enabled: boolean
  description?: string
  createdAt: string
}

const TRIGGER_TYPES = [
  { value: 'TIME', label: 'Time Schedule', icon: <AccessTime /> },
  { value: 'DEVICE_STATE', label: 'Device State', icon: <DeviceHub /> },
  { value: 'BLE_CONNECT', label: 'BLE Connected', icon: <Bluetooth /> },
  { value: 'BLE_DISCONNECT', label: 'BLE Disconnected', icon: <Bluetooth /> },
]

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  triggerType: z.string().min(1),
  triggerTime: z.string().optional(),
  action: z.string().min(1),
})
type FormData = z.infer<typeof schema>

export function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([
    { id: '1', name: 'Morning Routine', triggerType: 'TIME', enabled: true, description: 'Turn on lights at 7am', createdAt: new Date().toISOString() },
    { id: '2', name: 'Arrive Home', triggerType: 'BLE_CONNECT', enabled: false, description: 'Welcome scene on BLE connect', createdAt: new Date().toISOString() },
  ])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { triggerType: 'TIME', action: 'ALL_OFF' },
  })

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    const newAutomation: Automation = {
      id: Date.now().toString(),
      name: data.name,
      triggerType: data.triggerType,
      enabled: true,
      description: data.description,
      createdAt: new Date().toISOString(),
    }
    setAutomations((prev) => [...prev, newAutomation])
    setSaving(false)
    setDialogOpen(false)
    reset()
    toast.success('Automation created!')
  }

  const toggleEnabled = (id: string) => {
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  const handleDelete = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id))
    toast.success('Automation deleted')
  }

  const getTriggerIcon = (type: string) => TRIGGER_TYPES.find((t) => t.value === type)?.icon ?? <AutoFixHigh />

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Automation</Typography>
          <Typography color="text.secondary" variant="body2">{automations.filter((a) => a.enabled).length} active rules</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Create Rule</Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Automations trigger BLE commands to your ESP32 devices based on schedules or events.
      </Alert>

      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {automations.map((automation) => (
          <Card key={automation.id}>
            <ListItem>
              <Box sx={{ mr: 2, color: automation.enabled ? 'primary.main' : 'text.disabled' }}>
                {getTriggerIcon(automation.triggerType)}
              </Box>
              <ListItemText
                primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight={600}>{automation.name}</Typography>
                  <Chip size="small" label={TRIGGER_TYPES.find((t) => t.value === automation.triggerType)?.label} />
                </Box>}
                secondary={automation.description}
              />
              <ListItemSecondaryAction>
                <Switch checked={automation.enabled} onChange={() => toggleEnabled(automation.id)} size="small" />
                <IconButton size="small" color="error" onClick={() => handleDelete(automation.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Card>
        ))}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Automation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Rule Name" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField label="Description (Optional)" fullWidth multiline rows={2} {...register('description')} />
            <Controller
              name="triggerType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Trigger</InputLabel>
                  <Select {...field} label="Trigger">
                    {TRIGGER_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <TextField label="Time (for TIME trigger, e.g. 07:00)" fullWidth {...register('triggerTime')} placeholder="07:00" />
            <TextField label="BLE Command to Send" fullWidth {...register('action')} error={!!errors.action} helperText="e.g. LIGHT_1_ON, ALL_OFF, FAN_2" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); reset() }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
