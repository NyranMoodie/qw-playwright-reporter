import axios, { Axios } from 'axios';
import { bold, green } from 'picocolors';
import {
  QualityWatcherPayload,
  QualityWatcherResult,
} from './qualitywatcher.interface';

export class QualityWatcherService {
  private readonly apiKey: string;
  private readonly projectId: number;
  private readonly testRunName: string;
  private readonly description: string;
  private readonly includeAllCases: boolean;
  private readonly axios: Axios;

  constructor(options: QualityWatcherPayload) {
    if (!options.apiKey) {
      throw new Error('[apiKey] is missing. Please, provide it in the config');
    }
    if (!options.projectId) {
      throw new Error(
        '[projectId] is missed. Please, provide it in the config'
      );
    }
    if (!options.testRunName) {
      throw new Error(
        '[testRunName] is missed. Please, provide it in the config'
      );
    }
    if (!options.description) {
      throw new Error(
        '[description] is missed. Please, provide it in the config'
      );
    }
    if (!options.includeAllCases) {
      throw new Error(
        '[includeAllCases] is missing. Please, provide it in the config'
      );
    }

    this.apiKey = options.apiKey;
    this.projectId = options.projectId;
    this.testRunName = options.testRunName;
    this.description = options.description;
    this.includeAllCases = options.includeAllCases;

    this.axios = axios.create({
      baseURL: 'https://api.qualitywatcher.com/prod/nimble/v1/test-runner',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      ...options,
    });
  }

  async createRun(items: QualityWatcherResult[]): Promise<string> {
    console.log(items);
    const data = {
      projectId: this.projectId,
      testRunName: this.testRunName,
      description: this.description,
      includeAllCases: this.includeAllCases,
      suites: [...new Set(items.map(result => result?.suite_id))],
      results: items,
    };

    try {
      const response = await this.axios.post(
        '/add-automated-test-execution',
        data
      );

      console.log(
        `${bold(green(`✅ Test results have been posted to QualityWatcher`))}`
      );
      console.log(`${bold(green('👇 Check out the test result'))}`);
      return response.data;
    } catch (error) {
      console.log(error);
      //   if (isAxiosError(error)) {
      //     console.error(`Config: ${inspect(error.config)}`);

      //     if (error.response) {
      //       throw new Error(
      //         `\nStatus: ${error.response.status} \nHeaders: ${inspect(
      //           error.response.headers
      //         )} \nData: ${inspect(error.response.data)}`
      //       );
      //     } else if (error.request) {
      //       throw new Error(
      //         `The request was made but no response was received. \n Error: ${inspect(
      //           error.toJSON()
      //         )}`
      //       );
      //     } else {
      //       throw new Error(
      //         `Something happened in setting up the request that triggered an Error\n : ${inspect(
      //           error.message
      //         )}`
      //       );
      //     }
      //   }

      throw new Error(`\nUnknown error: ${error}`);
    }
  }
}
