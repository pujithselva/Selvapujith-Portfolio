type LogLevel = 'log' | 'warn' | 'error' | 'info';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private createLogEntry(level: LogLevel, component: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  log(component: string, message: string, data?: any) {
    const entry = this.createLogEntry('log', component, message, data);
    this.addLog(entry);
    console.log(`[${component}] ${message}`, data || '');
  }

  warn(component: string, message: string, data?: any) {
    const entry = this.createLogEntry('warn', component, message, data);
    this.addLog(entry);
    console.warn(`[${component}] ${message}`, data || '');
  }

  error(component: string, message: string, data?: any) {
    const entry = this.createLogEntry('error', component, message, data);
    this.addLog(entry);
    console.error(`[${component}] ${message}`, data || '');
  }

  info(component: string, message: string, data?: any) {
    const entry = this.createLogEntry('info', component, message, data);
    this.addLog(entry);
    console.info(`[${component}] ${message}`, data || '');
  }

  getLogs(level?: LogLevel, component?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component);
    }

    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export default new Logger();
