import Image from 'next/image'
import Head from 'next/head'
import CssBaseline from '@material-ui/core/CssBaseline'
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import groupBy from 'lodash.groupby'
import { Delete } from '@material-ui/icons'
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import {
  Button,
  Container,
  LinearProgress,
  GridList,
  GridListTile,
  GridListTileBar,
  Modal,
  Grid,
  Typography,
} from '@material-ui/core'

/**
 * Когда нибудь все интерфейсы будут вынесены в отдельный файл
 * но этот день, — не сегодня
 */

interface Values {
  tag: string
}

interface Giphy {
  tag: string
  updatedAt: number
  image: string
  height: number
  width: number
}

interface ModalError {
  open: boolean
  name: string
  description: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gridList: {
      flexWrap: 'nowrap',
      transform: 'translateZ(0)',
    },
    title: {
      color: theme.palette.primary.light,
    },
    titleBar: {
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  })
)

export default function Home() {
  const classes = useStyles()
  /**
   * Делаем один большой state для управления состоянием всего приложения,
   * часть формы далее будет реализованна через Formik для управления состоянием формы
   * просто потому могу
   */
  const [state, setState] = useState({
    groupedImages: {},
    storedImages: [],
    action: 'Group',
  })

  //Reset state to default
  function handlePurge() {
    setState({
      groupedImages: {},
      storedImages: [],
      action: 'Group',
    })
  }

  function rand() {
    return Math.round(Math.random() * 20) - 10
  }

  function getModalStyle() {
    const top = 50 + rand()
    const left = 50 + rand()

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    }
  }

  //state модального окна
  const [modalStyle] = useState(getModalStyle)
  const [open, setOpen] = useState({
    open: false,
    name: '',
    description: '',
  })

  const handleClose = () => {
    setOpen({
      open: false,
      name: '',
      description: '',
    })
  }

  /**
   * ответ на вопрос, как работают closures в js,
   * осталось только ключевое слово this добавить
   * ой, постойте-ка, у него другой контекст
   * в стрелочных функциях!
   */
  const groupImages = () => {
    if (state.action === 'Group') {
      //Group images with lodash groupBy
      const categories = groupBy(state.storedImages, 'tag')
      //Уж лучше было использовать Redux, чем пересобирать state каждый раз руками
      setState({
        groupedImages: { ...state.groupedImages, ...categories },
        storedImages: [...state.storedImages],
        action: 'Sort',
      })
    } else {
      const sortedTime = state.storedImages.sort(
        (a, b) => a.updatedAt - b.updatedAt
      )
      setState({
        groupedImages: { ...state.groupedImages },
        storedImages: sortedTime,
        action: 'Group',
      })
    }
  }

  /**
   * Немного красоты для grid-line,
   * магии ES6+, ternary operators и строгой typescript типизации
   */
  const beautyGrid = (resolution: number, width: number): number =>
    width > resolution ? 5 : Math.round(width / (resolution / 5))

  return (
    <main>
      <Head>
        <title>{'Giphy Tags'}</title>
      </Head>
      <CssBaseline />
      <Container maxWidth="lg">
        <Grid
          container
          alignContent="center"
          direction="row"
          justify="center"
          spacing={3}
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={12} sm={12}>
            <Typography variant="h1" component="h2" gutterBottom>
              Giphy Tags
            </Typography>
          </Grid>
          <Grid item xs={6} sm={6} style={{ width: 'auto' }}>
            <Formik
              initialValues={{
                tag: '',
              }}
              validate={(values) => {
                /**
                 * Пусть форма делает reject input
                 * без <popover> или <modal>
                 */
                const errors: Partial<Values> = {}
                if (!values.tag) {
                  errors.tag = 'Required'
                } else if (!/^[A-Za-z0-9]/i.test(values.tag)) {
                  errors.tag = 'Only letters or numbers are allowed!'
                }
                return errors
              }}
              onSubmit={async (values, { setSubmitting }) => {
                /**
                 * А можно ли было вообще обойтись без Formik? -да, конечно
                 * так-же вместо него, можно было бы взять Redux или
                 * React Hook Form, впрочем моя задача здесь, показать
                 * что я могу использовать как сторонние библиотеки для
                 * реализации форм, так стандартные хуки из коробки
                 */
                const response = await fetch(
                  `https://api.giphy.com/v1/gifs/random?api_key=1FIYRBT8TY3tPb1RuCLsnXg4Gx7kWeYp&tag=${values.tag}`
                )
                  .then((res) => res.json())
                  .catch(() =>
                    setOpen((prevState: ModalError) => ({
                      ...prevState,
                      open: true,
                      name: 'Ой, что-то пошло не так...',
                      description: 'Возникла http ошибка, попробуйте ещё раз',
                    }))
                  )
                if (response && response.data) {
                  if (!response.data.image_url) {
                    setOpen((prevState: ModalError) => ({
                      ...prevState,
                      open: true,
                      name: 'Давайте попробуем что-нибудь другое',
                      description: `Видимо на giphy картинок с ${values.tag} ещё не завезли`,
                    }))
                  } else {
                    setState({
                      groupedImages: { ...state.groupedImages },
                      storedImages: [
                        ...state.storedImages,
                        {
                          tag: values.tag,
                          image: response.data.image_url,
                          height: parseInt(response.data.image_height),
                          width: parseInt(response.data.image_width),
                          updatedAt: Date.now(),
                        },
                      ],
                      action: state.action,
                    })
                  }
                }
                setSubmitting(false)
              }}
            >
              {({ submitForm, isSubmitting }) => (
                <Form>
                  <Field
                    component={TextField}
                    type="tag"
                    label="tag"
                    name="tag"
                    className="input"
                  />
                  {isSubmitting && <LinearProgress />}
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={submitForm}
                  >
                    Submit
                  </Button>
                </Form>
              )}
            </Formik>
          </Grid>
          <Grid item xs={3} sm={3}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handlePurge}
              startIcon={<Delete />}
            >
              Purge
            </Button>
          </Grid>
          <Grid item xs={3} sm={3}>
            <Button variant="outlined" color="primary" onClick={groupImages}>
              {state.action}
            </Button>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Modal
              open={open.open}
              onClose={handleClose}
              aria-labelledby="error-title"
              aria-describedby="error-description"
            >
              {
                <div style={modalStyle} className={classes.paper}>
                  <h2 id="error-title">{open.name}</h2>
                  <p id="error-description">{open.description}</p>
                </div>
              }
            </Modal>
            {state.storedImages.length && state.action === 'Group' ? (
              /**
               * Можно просто сделать map => img xs,
               * но зачем, если есть Material GridList?
               */
              <GridList cellHeight={250} cols={5}>
                {state.storedImages.map((img: Giphy, i: number) => (
                  <GridListTile
                    key={i}
                    cols={beautyGrid(window.innerWidth | 1920, img.width)}
                  >
                    <Image
                      src={img.image}
                      width={img.width}
                      height={img.height}
                      alt={img.tag}
                    />
                    <GridListTileBar title={img.tag} />
                  </GridListTile>
                ))}
              </GridList>
            ) : (
              Object.values(state.groupedImages).map((value: Giphy[], i) => (
                <GridList key={i} className={classes.gridList} cols={2.5}>
                  {value.map((img: Giphy, i: number) => (
                    <GridListTile
                      key={i}
                      cols={beautyGrid(window.innerWidth | 1920, img.width)}
                    >
                      <Image
                        src={img.image}
                        width={img.width}
                        height={img.height}
                        alt={img.tag}
                      />
                      <GridListTileBar title={img.tag} />
                    </GridListTile>
                  ))}
                </GridList>
              ))
            )}
          </Grid>
        </Grid>
      </Container>
    </main>
  )
}
