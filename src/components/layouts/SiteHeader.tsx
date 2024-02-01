import { AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material'
import { useViewId } from '../../hooks/hashState'

export function SiteHeader() {
  const [viewId, setViewId] = useViewId()
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Map factory</Typography>
        <Tabs value={viewId}>
          <Tab
            label="Capture"
            value="default"
            onClick={() => setViewId('default')}
          />
          <Tab
            label="Vector"
            value="vector"
            onClick={() => setViewId('vector')}
          />
        </Tabs>
      </Toolbar>
    </AppBar>
  )
}
