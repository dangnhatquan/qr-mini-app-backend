export interface ZaloProfileInterface {
  id: string;
  name: string;
  error: number;
  message: string;
  is_sensitive?: boolean;
  picture?: {
    data: {
      url: string;
    };
  };
}