import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3d6fa2',
    },
    secondary: {
      main: '#cf2d0e',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#cdcdcd',
    },
  },
})

export default theme
