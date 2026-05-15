import { useEffect } from 'react'
import * as ScreenCapture from 'expo-screen-capture'

export function usePreventScreenCapture() {
  useEffect(() => {
    let subscription: any

    const enableProtection = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync()
      } catch (error) {
        console.error('Error preventing screen capture:', error)
      }
    }

    const disableProtection = async () => {
      try {
        await ScreenCapture.allowScreenCaptureAsync()
      } catch (error) {
        console.error('Error allowing screen capture:', error)
      }
    }

    // Enable protection when component mounts
    enableProtection()

    // Listen for screen capture events
    subscription = ScreenCapture.addScreenshotListener(() => {
      console.warn('Screenshot detected! This content is protected.')
      // You could add additional logic here, like showing a warning
    })

    return () => {
      // Cleanup
      subscription?.remove()
      disableProtection()
    }
  }, [])
}

export async function preventScreenCapture() {
  try {
    await ScreenCapture.preventScreenCaptureAsync()
  } catch (error) {
    console.error('Error preventing screen capture:', error)
  }
}

export async function allowScreenCapture() {
  try {
    await ScreenCapture.allowScreenCaptureAsync()
  } catch (error) {
    console.error('Error allowing screen capture:', error)
  }
}
