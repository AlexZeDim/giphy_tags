import Image from 'next/image'
import CssBaseline from '@material-ui/core/CssBaseline'
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
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
  uploadedAt: number
  image: string
  height: number
  width: number
}

export default function Home() {
  //Можно было бы сделать один большой state..
  const [images, setImages] = useState([])
  //..в виде объекта, и прописать ему интерфейс, но зачем?
  const [group, groupBy] = useState('Group')
  /**
   * Если что, это такая ирония, я просто хочу показать что понимаю как
   * работает управления состояния и без Redux, поэтому часть формы дальше будет
   * реализованна как через Formik для управления состоянием формы, так и отдельными
   * элементами (кнопками) со своим состояниями
   */

  function handlePurge() {
    setImages([])
  }

  /**
   * ответ на вопрос, как работают
   * closures в js, и какой стандарт JS я использую
   * осталось только ключевое слово this добавить
   * ой, постойте-ка, у него другой контекст
   * в стрелочных функциях!
   */
  const groupUnwind = () => {
    group === 'Group' ? groupBy('Unwind') : groupBy('Group')
  }

  /**
   * Немного красоты для grid-line и
   * строгой typescript типизации,
   * хорошо хоть interface не пришлось писать
   */
  const beautyGrid = (resolution: number, width: number): number => {
    if (width > resolution) {
      return 5
    } else {
      return Math.round(width / (resolution / 5))
    }
  }

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
            const { data, errors } = await fetch(
              `https://api.giphy.com/v1/gifs/random?api_key=1FIYRBT8TY3tPb1RuCLsnXg4Gx7kWeYp&tag=${values.tag}`
            ).then((res) => res.json())
            if (errors) {
              return
            } else {
              setImages((setImages) => [
                ...setImages,
                {
                  tag: values.tag,
                  image: data.image_url,
                  height: data.image_height,
                  width: data.image_width,
                },
              ])
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
        <Button variant="outlined" color="primary" onClick={groupUnwind}>
          {group}
        </Button>
        {images.length ? (
          /**
           * Можно просто сделать map => img xs,
           * но зачем, если есть Material GridList?
           */
          <GridList cellHeight={250} cols={5}>
            {images.map((img: Giphy, i: number) => (
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
          ``
        )}
      </Container>
    </main>
  )
}
