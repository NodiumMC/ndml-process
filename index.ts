import execa from 'execa'
import { ProcessRunException } from './ProcessRunException'

export const resolveJavaExecutable = (javaPath?: string | null): string => {
  return javaPath ? `"${javaPath}"` : 'java'
}

export const checkJava = async (javaPath?: string): Promise<boolean> => {
  try {
    const { stderr } = await execa.command(
      `${resolveJavaExecutable(javaPath)} -version`
    )
    return !!stderr.matchAll(/java version "(?<version>.+?)"/g).next().value
      ?.groups
  } catch (e) {
    return false
  }
}

const run = (
  command: string,
  args: string[],
  log?: (data: string) => void,
  cwd?: string
): Promise<void> => {
  return new Promise<void>(resolve => {
    try {
      const child = execa(command, args, {
        cwd: cwd || process.cwd(),
        stdout: 'inherit',
        stderr: 'inherit',
      })
      if (log) {
        child.stdout?.on('data', (data: string) => log(data))
        child.stderr?.on('data', (data: string) => log(data))
      }
      child
        .then(() => resolve())
        .catch((e: any) => {
          throw new ProcessRunException(e)
        })
    } catch (e: any) {
      throw new ProcessRunException(e)
    }
  })
}

export const runJava = async (
  javaPath: string | undefined | null,
  args: string[],
  log?: (data: string) => void,
  cwd?: string
) => await run(resolveJavaExecutable(javaPath), args, log, cwd)
