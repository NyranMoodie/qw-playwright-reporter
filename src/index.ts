import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import {
  QualityWatcherPayload,
  QualityWatcherResult,
} from './qualitywatcher.interface';
const REGEX_SUITE_AND_TEST_ID = /\bS(\d+)C(\d+)\b/g;
import { QualityWatcherService } from './qualitywatcher.service';
class QualityWatcherReporter implements Reporter {
  private qualityWatcherService!: QualityWatcherService;
  private results: QualityWatcherResult[] = [];
  private options: QualityWatcherPayload;
  constructor(options: QualityWatcherPayload) {
    this.options = options;
  }

  onBegin() {
    this.qualityWatcherService = new QualityWatcherService(this.options);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const { suite_id, test_id } = getSuiteAndCaseIds(test.title);
    this.results.push({
      suite_id: suite_id,
      test_id: test_id,
      comment: result.status,
      status: result.status,
      time: result.duration,
      title: test.title,
    });
  }
  async onEnd() {
    if (this.results.length > 0) {
      await this.qualityWatcherService.createRun(this.results);
    } else {
      console.log(
        `There are no tests to post to QualityWatcher. Please, check your tests.`
      );
    }
    console.log(
      'Length of failed tests',
      this.results.filter(item => item.status === 'failed').length
    );
  }
}
function getSuiteAndCaseIds(title: string) {
  let suiteAndCaseIds;
  let suiteId;
  let caseId;
  while ((suiteAndCaseIds = REGEX_SUITE_AND_TEST_ID.exec(title)) != null) {
    suiteId = suiteAndCaseIds[1];
    caseId = suiteAndCaseIds[2];
  }
  return {
    suite_id: Number(suiteId),
    test_id: Number(caseId),
  };
}
export default QualityWatcherReporter;