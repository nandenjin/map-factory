import {
  Alert,
  Box,
  BoxProps,
  Button,
  LinearProgress,
  Link,
  SpeedDial,
  Typography,
} from '@mui/material'
import { OSMRenderer } from '../ui/OSMRenderer'
import { useEffect, useMemo, useState } from 'react'
import { useMapBoundsToCapture, useViewId } from '../../hooks/hashState'
import { LatLngBounds } from 'leaflet'
import { queryAll } from '../../lib/overpass'
import { getMetersByLatLng } from '../../lib/geo'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { Download, OpenInNew } from '@mui/icons-material'

type VectorMapViewProps = { paused?: boolean } & BoxProps

export function VectorMapView({ paused, ...props }: VectorMapViewProps) {
  const [, setViewId] = useViewId()
  const [downloading, setDownloading] = useState(false)
  const [osmData, setOSMData] = useState<string | null>(null)

  const [mapBoundsToCapture] = useMapBoundsToCapture()
  const [capturedBounds, setCapturedBounds] = useState<LatLngBounds | null>(
    null,
  )
  const [bigDataWarningConfirmed, setBigDataWarningConfirmed] = useState(false)

  const areaToCapture = useMemo(() => {
    const bounds = new LatLngBounds(mapBoundsToCapture)
    const [x1, y1] = getMetersByLatLng(bounds.getNorth(), bounds.getWest())
    const [x2, y2] = getMetersByLatLng(bounds.getSouth(), bounds.getEast())
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)

    return width * height
  }, [mapBoundsToCapture])
  const bigDataWarningRequired = areaToCapture > 1000 * 1000 * 10 // If over 10km^2

  const updateRequired = useMemo(
    () => !capturedBounds || !capturedBounds.equals(mapBoundsToCapture),
    [capturedBounds, mapBoundsToCapture],
  )

  useEffect(() => {
    if (!updateRequired) return
    setOSMData(null)
    setBigDataWarningConfirmed(false)
  }, [mapBoundsToCapture, updateRequired])

  useEffect(() => {
    if (paused) return
    if (downloading) return
    if (bigDataWarningRequired && !bigDataWarningConfirmed) return
    if (updateRequired) {
      setDownloading(true)
      setOSMData(null)
      queryAll(mapBoundsToCapture).then((data) => {
        setCapturedBounds(new LatLngBounds(mapBoundsToCapture))
        setOSMData(data)
        setDownloading(false)
      })
    }
    // Download should only be performed by updateRequired or bigDataWarningConfirmed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, updateRequired, bigDataWarningRequired, bigDataWarningConfirmed])

  const [renderedSVG, setRenderedSVG] = useState<string | null>(null)
  const renderedURL = useMemo(
    () => (renderedSVG ? URL.createObjectURL(new Blob([renderedSVG])) : null),
    [renderedSVG],
  )
  const numberFormat = new Intl.NumberFormat()

  return (
    <Box {...props}>
      {(osmData && capturedBounds && (
        <>
          <TransformWrapper centerOnInit>
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                backgroundColor: '#ccc',
              }}
              contentStyle={{
                backgroundColor: '#fff',
                lineHeight: 0,
              }}
            >
              <OSMRenderer
                data={osmData}
                bounds={capturedBounds}
                onRendered={setRenderedSVG}
              />
            </TransformComponent>
          </TransformWrapper>
          <Box sx={{ position: 'fixed', bottom: 10, left: 10 }}>
            <Typography variant="body2">
              Attribution:{' '}
              <Link
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener"
              >
                &copy; OpenStreetMap contributors.
                <OpenInNew fontSize="inherit" />
              </Link>
            </Typography>
          </Box>
          <SpeedDial
            ariaLabel="Download"
            sx={{
              position: 'absolute',
              bottom: 32,
              right: 32,
              visibility: renderedURL ? 'visible' : 'hidden',
            }}
            icon={<Download />}
            onClick={() => {
              if (renderedURL) {
                const serializedBounds = capturedBounds.toBBoxString()
                const link = document.createElement('a')
                link.href = renderedURL
                link.download = `map-factory_${serializedBounds}.svg`
                link.click()
              }
            }}
          />
        </>
      )) || (
        <Box
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {(downloading && (
            <Box minWidth="200px" textAlign="center">
              <Typography variant="body1" margin={1}>
                Downloading...
              </Typography>
              <LinearProgress />
            </Box>
          )) ||
            (bigDataWarningRequired && !bigDataWarningConfirmed && (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="warning"
                    onClick={() => setBigDataWarningConfirmed(true)}
                  >
                    Confirm
                  </Button>
                }
                sx={{ maxWidth: '30rem', m: 2 }}
              >
                You are about to download data for{' '}
                {numberFormat.format(Math.round(areaToCapture / (1000 * 1000)))}{' '}
                km<sup>2</sup> area, which may be large amount. Be careful not
                to overload the source server, do this at your own own
                responsibility.
              </Alert>
            )) || (
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
