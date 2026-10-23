import appleLogo from "../../../assets/images/Apple_Logo.webp";
import samsungLogo from "../../../assets/images/Samsung_Logo.webp";
import googleLogo from "../../../assets/images/Google_Logo.webp";
import xiaomiLogo from "../../../assets/images/Xiaomi_Logo.webp";
import tecnoLogo from "../../../assets/images/Tecno_Logo.webp";
import infinixLogo from "../../../assets/images/Infinix_Logo.webp";

export interface StoreBrand {
  name: string;
  slug: string;
  logo: string;
}

export const storeBrands: StoreBrand[] = [
  { name: "Apple", slug: "apple", logo: appleLogo },
  { name: "Samsung", slug: "samsung", logo: samsungLogo },
  { name: "Google", slug: "google", logo: googleLogo },
  { name: "Xiaomi", slug: "xiaomi", logo: xiaomiLogo },
  { name: "Tecno", slug: "tecno", logo: tecnoLogo },
  { name: "Infinix", slug: "infinix", logo: infinixLogo },
];
