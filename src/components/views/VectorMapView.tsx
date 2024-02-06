import {
  Box,
  BoxProps,
  Button,
  LinearProgress,
  Typography,
} from '@mui/material'
import { OSMRenderer } from '../ui/OSMRenderer'
import { useEffect, useState } from 'react'
import { useMapBoundsToCapture, useViewId } from '../../hooks/hashState'
import { LatLngBounds } from 'leaflet'
import { queryAll } from '../../lib/overpass'

type VectorMapViewProps = { paused?: boolean } & BoxProps

export function VectorMapView({ paused, ...props }: VectorMapViewProps) {
  const [, setViewId] = useViewId()
  const [downloading, setDownloading] = useState(false)
  const [osmData, setOSMData] = useState<string | null>(null)

  const [mapBoundsToCapture] = useMapBoundsToCapture()
  const [capturedBounds, setCapturedBounds] = useState<LatLngBounds | null>(
    null,
  )

  useEffect(() => {
    if (paused) return
    if (!capturedBounds || !capturedBounds.equals(mapBoundsToCapture)) {
      setDownloading(true)
      setOSMData(null)
      setCapturedBounds(new LatLngBounds(mapBoundsToCapture))
      queryAll(mapBoundsToCapture).then((data) => {
        setOSMData(data)
        setDownloading(false)
      })
    }
  }, [paused, mapBoundsToCapture, capturedBounds])

  return (
    <Box {...props}>
      {osmData && capturedBounds ? (
        <OSMRenderer data={osmData} bounds={capturedBounds} />
      ) : (
        <Box
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {downloading ? (
            <Box minWidth="200px" textAlign="center">
              <Typography variant="body1" margin={1}>
                Downloading...
              </Typography>
              <LinearProgress />
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" margin={1}>
                No data to render
              </Typography>
              <Button onClick={() => setViewId('default')}>
                Back to map picker
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
