
import { AgentiaCommand } from '@copado/agentia-plugin-sdk'
import { Args, Flags } from '@oclif/core'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

interface Finding {
  ruleId: string
  severity: string
  title: string
  line: number
  evidence: string
  recommendation: string
}

interface AnalysisReport {
  tool: string
  mode: string
  analyzedAt: string
  riskAssessment: {
    score: number
    level: string
    explanation: string
  }
  summary: {
    linesAnalyzed: number
    findings: number
    high: number
    medium: number
    status: string
  }
  findings: Finding[]
  disclaimer: string
}

export default class ReleasepilotAnalyze extends AgentiaCommand {
  static override description =
    'Analyze a deployment log using ReleasePilot AI local diagnostic rules'

  static override examples = [
    '<%= config.bin %> releasepilot analyze samples/deployment.log',
    '<%= config.bin %> releasepilot analyze samples/deployment.log --json',
  ]

  static override args = {
    file: Args.string({
      description: 'Path to the deployment log file',
      required: true,
    }),
  }

  static override flags = {
    jsonOut: Flags.string({
      description: 'Optional path to save the diagnostic report as JSON',
    }),
  }

  public async run(): Promise<AnalysisReport> {
    const { args, flags } = await this.parse(ReleasepilotAnalyze)

    const logPath = path.resolve(args.file)
    const content = await readFile(logPath, 'utf8')

    // Load the existing analyzer from the main ReleasePilot project.
    const analyzerPath = path.resolve(
      process.cwd(),
      'src',
      'analyzer.js',
    )

    const { analyzeLog } = await import(pathToFileURL(analyzerPath).href)
    const report: AnalysisReport = analyzeLog(content)

    if (flags.jsonOut) {
      const outputPath = path.resolve(flags.jsonOut)
      const { mkdir, writeFile } = await import('node:fs/promises')
      await mkdir(path.dirname(outputPath), { recursive: true })
      await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    }

    this.display(() => {
      this.log('ReleasePilot AI — Deployment Log Analysis')
      this.log('-----------------------------------------')
      this.log(`File: ${logPath}`)
      this.log(`Risk score: ${report.riskAssessment.score}/100`)
      this.log(`Risk level: ${report.riskAssessment.level}`)
      this.log(`Lines analyzed: ${report.summary.linesAnalyzed}`)
      this.log(`Findings: ${report.summary.findings}`)
      this.log(
        `Severity totals: ${report.summary.high} high, ${report.summary.medium} medium`,
      )

      for (const finding of report.findings) {
        this.log('')
        this.log(`[${finding.severity.toUpperCase()}] ${finding.title}`)
        this.log(`Rule: ${finding.ruleId} | Line: ${finding.line}`)
        this.log(`Evidence: ${finding.evidence}`)
        this.log(`Recommendation: ${finding.recommendation}`)
      }

      this.log('')
      this.log(`Note: ${report.disclaimer}`)

      if (flags.jsonOut) {
        this.log(`JSON report saved to: ${path.resolve(flags.jsonOut)}`)
      }
    })

    return report
  }
}
