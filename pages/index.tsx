import Image from 'next/image'
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import CssBaseline from '@material-ui/core/CssBaseline'
import {
  Button,
  Container,
  LinearProgress,
  Typography,
} from '@material-ui/core'
import { TextField } from 'formik-material-ui'

interface Values {
  tag: string
}

export default function Home() {
  const [images, setImages] = useState([])
  /**
   * TODO clea
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
            const errors: Partial<Values> = {}
            if (!values.tag) {
              errors.tag = 'Required'
            } else if (!/^[A-Za-z0-9]/i.test(values.tag)) {
              errors.tag =
                'Try to use only letter or numbers, everything else is not allowed'
            }
            return errors
          }}
          onSubmit={async (values, { setSubmitting }) => {
            const {
              // eslint-disable-next-line @typescript-eslint/camelcase
              data: { image_url, image_height, image_width },
              errors,
            } = await fetch(
              `https://api.giphy.com/v1/gifs/random?api_key=1FIYRBT8TY3tPb1RuCLsnXg4Gx7kWeYp&tag=${values.tag}`
            ).then((res) => res.json())
            setImages((setImages) => [
              ...setImages,
              {
                // eslint-disable-next-line @typescript-eslint/camelcase
                image: image_url,
                height: image_height,
                width: image_width,
              },
            ])
            setSubmitting(false)
            console.log(data, errors)
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
            </Form>
          )}
        </Formik>
        {image ? (
          <Image
            src="https://media3.giphy.com/media/FsSOIASsQbJyE/giphy.gif"
            width="400"
            height="400"
            alt="Profile Picture"
          />
        ) : (
          ``
        )}
      </Container>
    </main>
  )
}
