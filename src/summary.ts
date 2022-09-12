/* eslint-disable complexity */
import slugify from '@sindresorhus/slugify'
import {mkdirp, readFile, writeFile, writeFileSync} from 'fs-extra'
import {join} from 'path'
import {format} from 'prettier'
import {getResponseTimeForSite} from './helpers/calculate-response-time'
import {getUptimePercentForSite} from './helpers/calculate-uptime'
import {getConfig} from './helpers/config'
import {commit, push} from './helpers/git'
import {SiteStatus} from './interfaces'
import {parseURL} from 'whatwg-url'
import {getResponseTimeColor, getUptimeColor} from './helpers/get-badge-color'
import {existsSync} from 'fs-extra'
import {infoErrorLogger} from './helpers/log'
import {cli} from 'cli-ux'
import chalk from 'chalk'

export const generateSummary = async () => {
  cli.action.start('Running summary workflow')
  await mkdirp('history')
  const config = await getConfig()
  const i18n = config.i18n || {}

  if (!existsSync('README.md')) {
    writeFileSync('README.md', `# 📈 ${i18n.liveStatus || 'Live Status'}: ${
      i18n.liveStatusHtmlComment || '<!--live status-->'
    } **${i18n.allSystemsOperational || '🟩 All systems operational'}**\n<!--start: description--><!--end: description-->\n<!--start: status pages--><!--end: status pages-->`)
  }
  let readmeContent = await readFile(join('.', 'README.md'), 'utf8')

  const startText = readmeContent.split(
    config.summaryStartHtmlComment || '<!--start: status pages-->'
  )[0]
  const endText = readmeContent.split(
    config.summaryEndHtmlComment || '<!--end: status pages-->'
  )[1]

  // This object will track the summary data of all sites
  const pageStatuses: Array<SiteStatus> = []

  // We'll keep incrementing this if there are down/degraded sites
  // This is used to show the overall status later
  let numberOfDown = 0
  let numberOfDegraded = 0

  // Loop through each site and add compute the current status
  for await (const site of config.sites) {
    const slug = site.slug || slugify(site.name)

    const uptimes = await getUptimePercentForSite(slug)
    infoErrorLogger.info('Uptimes', uptimes)

    const responseTimes = await getResponseTimeForSite(slug)
    infoErrorLogger.info('Response times', responseTimes)

    let fallbackIcon = ''
    try {
      fallbackIcon = `https://www.google.com/s2/favicons?domain=${parseURL(site.url)?.host}`
    } catch (error) {}

    pageStatuses.push({
      name: site.name,
      url: site.urlSecretText || site.url,
      icon: site.icon || fallbackIcon,
      slug,
      status: responseTimes.currentStatus,
      uptime: uptimes.all,
      uptimeDay: uptimes.day,
      uptimeWeek: uptimes.week,
      uptimeMonth: uptimes.month,
      uptimeYear: uptimes.year,
      time: Math.floor(responseTimes.all),
      timeDay: responseTimes.day,
      timeWeek: responseTimes.week,
      timeMonth: responseTimes.month,
      timeYear: responseTimes.year,
      dailyMinutesDown: uptimes.dailyMinutesDown,
    })
    if (responseTimes.currentStatus === 'down') numberOfDown++
    if (responseTimes.currentStatus === 'degraded') numberOfDegraded++
  }

  if (readmeContent.includes(config.summaryStartHtmlComment || '<!--start: status pages-->')) {
    readmeContent = `${startText}${config.summaryStartHtmlComment || '<!--start: status pages-->'}
<!-- This summary is generated by Upptime (https://github.com/upptime/upptime) -->
<!-- Do not edit this manually, your changes will be overwritten -->
<!-- prettier-ignore -->
| ${i18n.url || 'URL'} | ${i18n.status || 'Status'} | ${i18n.history || 'History'} | ${
  i18n.responseTime || 'Response Time'
} | ${i18n.uptime || 'Uptime'} |
| --- | ------ | ------- | ------------- | ------ |
${pageStatuses
  .map(
    page =>
      `| <img alt="" src="${page.icon}" height="13"> ${
        page.url.includes('$') ? page.name : `[${page.name}](${page.url})`
      } | ${
        page.status === 'up' ?
          i18n.up || '🟩 Up' :
          page.status === 'degraded' ?
            i18n.degraded || '🟨 Degraded' :
            i18n.down || '🟥 Down'
      } | ${page.slug}.yml | <details><summary> ${page.timeWeek}${
        i18n.ms || 'ms'
      }</summary><br><img alt="${
        i18n.responseTime || 'Response time'
      } ${
        page.time
      }" src="https://img.shields.io/badge/${
        i18n.responseTime || 'response time'
      }-${
        page.time
      }-${
        getResponseTimeColor(page.time)
      }"><br><img alt="${
        i18n.responseTimeDay || '24-hour response time'
      } ${
        page.timeDay
      }" src="https://img.shields.io/badge/${
        i18n.responseTimeDay || 'response time 24h'
      }-${
        page.timeDay
      }-${
        getResponseTimeColor(page.timeDay)
      }"><br><img alt="${
        i18n.responseTimeWeek || '7-day response time'
      } ${
        page.timeWeek
      }" src="https://img.shields.io/badge/${
        i18n.responseTimeWeek || 'response time 7d'
      }-${
        page.timeWeek
      }-${
        getResponseTimeColor(page.timeWeek)
      }"><br><img alt="${
        i18n.responseTimeMonth || '30-day response time'
      } ${
        page.timeMonth
      }" src="https://img.shields.io/badge/${
        i18n.responseTimeMonth || 'response time 30d'
      }-${
        page.timeMonth
      }-${
        getResponseTimeColor(page.timeMonth)
      }"><br><img alt="${
        i18n.responseTimeYear || '1-year response time'
      } ${
        page.timeYear
      }" src="https://img.shields.io/badge/${
        i18n.responseTimeYear || 'response time 1y'
      }-${
        page.timeYear
      }-${
        getResponseTimeColor(page.timeYear)
      }"></details> | <details><summary>${page.uptimeWeek}</summary><img alt="${
        i18n.uptime || 'All-time uptime'
      } ${
        page.uptime
      }" src="https://img.shields.io/badge/${
        i18n.uptime || 'uptime'
      }-${
        page.uptime
      }25-${
        getUptimeColor(page.uptime)
      }"><br><img alt="${
        i18n.uptimeDay || '24-hour uptime'
      } ${
        page.uptimeDay
      }" src="https://img.shields.io/badge/${
        i18n.uptimeDay || 'uptime 24h'
      }-${
        page.uptimeDay
      }25-${
        getUptimeColor(page.uptimeDay)
      }"><br><img alt="${
        i18n.uptimeWeek || '7-day uptime'
      } ${
        page.uptimeWeek
      }" src="https://img.shields.io/badge/${
        i18n.uptimeWeek || 'uptime 7d'
      }-${
        page.uptimeWeek
      }25-${
        getUptimeColor(page.uptimeWeek)
      }"><br><img alt="${
        i18n.uptimeMonth || '30-day uptime'
      } ${
        page.uptimeMonth
      }" src="https://img.shields.io/badge/${
        i18n.uptimeMonth || 'uptime 30d'
      }-${
        page.uptimeMonth
      }25-${
        getUptimeColor(page.uptimeMonth)
      }"><br><img alt="${
        i18n.uptimeYear || '1-year uptime'
      } ${
        page.uptimeYear
      }" src="https://img.shields.io/badge/${
        i18n.uptimeYear || 'uptime 1y'
      }-${
        page.uptimeYear
      }25-${
        getUptimeColor(page.uptimeYear)
      }"></details>`
  )
  .join('\n')}
${config.summaryEndHtmlComment || '<!--end: status pages-->'}${endText}`
  }

  readmeContent = readmeContent
  .split('\n')
  .map((line, _) => {
    if (
      line.includes('<!--start: description--><!--end: description-->')
    )
      return '\nWith [Upptime](https://upptime.js.org), you can get your own unlimited and free uptime monitor and status page. We use Issues as incident reports, Cron Jobs as uptime monitors, and Pages for the status page.'
    return line
  })
  .filter(line => !line.startsWith(`## 📈 ${i18n.liveStatus || 'Live Status'}`))
  .join('\n')

  // Add live status line
  readmeContent = readmeContent
  .split('\n')
  .map(line => {
    if (line.includes('<!--live status-->')) {
      line = `${line.split('<!--live status-->')[0]}<!--live status--> **${
        numberOfDown === 0 ?
          numberOfDegraded === 0 ?
            i18n.allSystemsOperational || '🟩 All systems operational' :
            i18n.degradedPerformance || '🟨 Degraded performance' :
          numberOfDown === config.sites.length ?
            i18n.completeOutage || '🟥 Complete outage' :
            i18n.partialOutage || '🟧 Partial outage'
      }**`
    }
    return line
  })
  .join('\n')

  await writeFile(join('.', 'README.md'), format(readmeContent, {parser: 'markdown'}))
  commit(
    (config.commitMessages || {}).readmeContent ||
      ':pencil: Update summary in README [skip ci] [upptime]',
    (config.commitMessages || {}).commitAuthorName,
    (config.commitMessages || {}).commitAuthorEmail
  )

  await writeFile(join('.', 'history', 'summary.json'), JSON.stringify(pageStatuses, null, 2))
  commit(
    (config.commitMessages || {}).summaryJson ||
      ':card_file_box: Update status summary [skip ci] [upptime]',
    (config.commitMessages || {}).commitAuthorName,
    (config.commitMessages || {}).commitAuthorEmail
  )
  if (config.commits?.provider && config.commits?.provider === 'GitHub')
    push()
  cli.action.stop(chalk.green('done'))
}
