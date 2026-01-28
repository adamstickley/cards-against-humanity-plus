import { DataSource, DataSourceOptions } from 'typeorm';
import { configService } from './config.service';

class TypeORMService {
  datasource: DataSource;
  db: DataSource;
  constructor() {
    //
  }

  dataSource(): DataSource {
    this.datasource = new DataSource(
      configService.getTypeOrmConfig() as DataSourceOptions,
    );
    return this.datasource;
  }

  async initialize(): Promise<DataSource> {
    this.db = await this.dataSource().initialize();
    return this.db;
  }
}

const typeORMService = new TypeORMService();

export { typeORMService };
