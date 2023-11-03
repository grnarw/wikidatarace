export class FormatHelper {
  /**
   * Formate le temps en minutes et secondes
   * @param time
   */
  public static formatTime(time: number): string {
    const minutes: string = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds: string = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
