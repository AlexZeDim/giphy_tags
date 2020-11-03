import Image from 'next/image'
import CssBaseline from '@material-ui/core/CssBaseline'
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import groupBy from 'lodash.groupby'
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Container,
  LinearProgress,
  GridList,
  GridListTile,
  GridListTileBar,
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
    },
    gridList: {
      flexWrap: 'nowrap',
      // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
      transform: 'translateZ(0)',
    },
    title: {
      color: theme.palette.primary.light,
    },
    titleBar: {
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
  }),
);

export default function Home() {
  const classes = useStyles();
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
      <CssBaseline />
      <Container maxWidth="lg">
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
            const { data, errors } = await fetch(
              `https://api.giphy.com/v1/gifs/random?api_key=1FIYRBT8TY3tPb1RuCLsnXg4Gx7kWeYp&tag=${values.tag}`
            ).then((res) => res.json())
            if (errors) {
              return
            } else {
              setState({
                groupedImages: { ...state.groupedImages },
                storedImages: [
                  ...state.storedImages,
                  {
                    tag: values.tag,
                    image: data.image_url,
                    height: parseInt(data.image_height),
                    width: parseInt(data.image_width),
                    updatedAt: Date.now(),
                  },
                ],
                action: state.action,
              })
            }
            setSubmitting(false)
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form>
              <Field component={TextField} type="tag" label="tag" name="tag" />
              {isSubmitting && <LinearProgress />}
              <br />
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
        <Button variant="contained" color="primary" onClick={handlePurge}>
          Purge
        </Button>
        <Button variant="outlined" color="primary" onClick={groupImages}>
          {state.action}
        </Button>
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
          Object.keys(state.groupedImages).map((title: string, i: number) =>
            <GridList key={i} className={classes.gridList} cols={2.5}>
              {state.groupedImages.[title].map((img: Giphy, i: number) => (
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
          )
        )}
      </Container>
    </main>
  )
}
