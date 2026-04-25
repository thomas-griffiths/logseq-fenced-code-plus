import '@logseq/libs'
import React from 'react'

export default function (props: { content: string }) {
  const { content } = props
  const elRef = React.useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const host = logseq.Experiments.ensureHostScope()

  React.useEffect(() => {
    if (host.mermaid) {
      setReady(true)
      return
    }

    let timer: ReturnType<typeof setTimeout>
    logseq.Experiments
      .loadScripts('./vendors/mermaid.min.js')
      .then(() => {
        timer = setTimeout(() => {
          setReady(true)

          let theme = "default"
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = "dark"
          }
          host.mermaid.mermaidAPI.initialize({
            startOnLoad: false,
            theme
          })
        }, 50)
      })
      .catch((e) => {
        console.error('Failed to load mermaid', e)
        setError('Failed to load mermaid renderer.')
      })

    return () => {
      timer && clearTimeout(timer)
    }
  }, [host])

  React.useEffect(() => {
    if (!ready || !content?.trim()) return

    const renderMermaid = async () => {
      if (host.mermaid && elRef.current) {
        try {
          setError(null)
          elRef.current.textContent = content
          delete elRef.current.dataset.processed

          await host.mermaid.run({
            nodes: [elRef.current]
          })
        } catch (e) {
          console.error('Failed to render mermaid block', e)
          setError('Unable to render this mermaid diagram.')
        }
      }
    }

    renderMermaid()
  }, [ready, content])

  return (
    <>
      {error ?
        (<strong> {error}</strong>) :
        ready ?
        (<div className={'mermaid'} ref={elRef}/>) :
        (<strong> Loading ...</strong>)
      }
    </>)
}
