import Image from 'next/image'
import CssBaseline from '@material-ui/core/CssBaseline'
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { Button, Container, LinearProgress } from '@material-ui/core'
import { TextField } from 'formik-material-ui'

interface Values {
  tag: string
}

interface Giphy {
  image: string
  height: number
  width: number
}

export default function Home() {
  const [images, setImages] = useState([])
  /**
   * TODO clear State
   */
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
            setImages((setImages) => [
              ...setImages,
              {
                image: data.image_url,
                height: data.image_height,
                width: data.image_width,
              },
            ])
            setSubmitting(false)
            console.log(errors)
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form>
              <Field component={TextField} type="tag" label="tag" name="tag" />
              {isSubmitting && <LinearProgress />}
              <br />
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={submitForm}
              >
                Submit
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={submitForm}
              >
                Purge
              </Button>
            </Form>
          )}
        </Formik>
        {images.length
          ? images.map((img: Giphy, i: number) => (
              <Image
                key={i}
                src={img.image}
                width={img.width}
                height={img.height}
                alt="Profile Picture"
              />
            ))
          : ``}
      </Container>
    </main>
  )
}
