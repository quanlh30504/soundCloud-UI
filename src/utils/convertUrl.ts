import { Platform } from "react-native";

const LOCAL_IP = "localhost";
const PORT = 3000;

/**
 * Lấy tên file từ đường dẫn
 * @param filePath Đường dẫn Windows dạng "D:\\GITHUB\\...\\Enchanted_Taylor_Swift.mp3"
 */
function getFileName(filePath: string): string {
  const segments = filePath.split(/[/\\]/); // Tách cả slash và backslash
  return segments[segments.length - 1];
}

/**
 * Chuyển file path Windows sang URL stream tạm thời từ local server
 * @param filePath 
 * @returns string
 */
export function convertPathToUrl(filePath: string): string {
  const fileName = getFileName(filePath);
  return `http://${LOCAL_IP}:${PORT}/music/${encodeURIComponent(fileName)}`;
}
