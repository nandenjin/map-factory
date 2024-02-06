import { AppBar, Toolbar, Typography, Tabs, Tab, Link } from '@mui/material'
import { useViewId } from '../../hooks/hashState'
import { OpenInNew } from '@mui/icons-material'

export function SiteHeader() {
  const [viewId, setViewId] = useViewId()
  return (
    <AppBar position="static" color="inherit" style={{ zIndex: 500 }}>
      <Toolbar variant="dense">
        <Typography variant="h6">map-factory</Typography>
        <Tabs value={viewId} sx={{ marginLeft: 2, flexGrow: 1 }}>
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
          <Tab label="Tile" value="tile" onClick={() => setViewId('tile')} />
        </Tabs>
        <Link
          href="https://github.com/nandenjin/map-factory"
          target="_blank"
          rel="noopener"
          variant="body2"
        >
          GitHub
          <OpenInNew fontSize="inherit" />
        </Link>
      </Toolbar>
    </AppBar>
  )
}
