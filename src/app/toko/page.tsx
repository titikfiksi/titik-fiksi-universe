import { db } from "@/lib/db";
import ProductSlider from "@/components/ProductSlider";
import { ExternalLink, Heart, ShoppingBag, Wrench } from "lucide-react";
import type { FC } from "react";

// Static revalidate for ISR
export const revalidate = 60;

type Settings = {
  isActive?: boolean;
} | null;

type DonationLink = {
  id: string;
  url: string;
  platform: string;
};

type Sponsor = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  linkUrl: string;
};

const MaintenanceNotice: FC = () => (
  <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-[100]">
    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gray-700">
      <Wrench size={40} className="text-blue-500 animate-bounce" />
    </div>
    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
      Website Sedang <span className="text-blue-500">Perbaikan</span>
    </h1>
    <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
      Kami sedang melakukan peningkatan sistem. Silakan kembali beberapa saat lagi.
    </p>
  </div>
);

const DonationSection: FC<{ donations: DonationLink[] }> = ({ donations }) =>
  donations.length > 0 ? (
    <section>
      <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
        <Heart className="text-pink-500" size={28} />
        <h2 className="text-2xl md:text-3xl font-black text-gray-900">
          Saluran Donasi
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {donations.map((donasi) => (
          <a
            key={donasi.id}
            href={donasi.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white p-5 rounded-2xl border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-300 transition group"
          >
            <span className="font-bold text-gray-800 uppercase group-hover:text-pink-600">
              {donasi.platform}
            </span>
            <ExternalLink size={18} className="text-pink-300 group-hover:text-pink-500" />
          </a>
        ))}
      </div>
    </section>
  ) : null;

const SponsorsSection: FC<{ sponsors: Sponsor[] }> = ({ sponsors }) => (
  <section>
    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
      <ShoppingBag className="text-indigo-600" size={28} />
      <h2 className="text-2xl md:text-3xl font-black text-gray-900">
        Produk Rekomendasi
      </h2>
    </div>
    {sponsors.length === 0 ? (
      <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-bold">
          Belum ada produk yang ditampilkan saat ini.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
          >
            <ProductSlider
              images={
                typeof sponsor.imageUrl === "string"
                  ? sponsor.imageUrl.split(",")
                  : []
              }
              title={sponsor.title}
            />
            <div className="p-5 md:p-6 flex flex-col flex-grow">
              <h3 className="font-black text-indigo-800 text-lg uppercase leading-tight line-clamp-2 mb-2">
                {sponsor.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                {sponsor.description}
              </p>
              <a
                href={sponsor.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Lihat Produk <ExternalLink size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const fetchData = async () => {
  // Keep Prisma calls type-safe and avoid unnecessary data
  const [settings, donations, sponsors] = await Promise.all([
    db.settings.findFirst() as Promise<Settings>,
    db.donationLink.findMany() as Promise<DonationLink[]>,
    db.sponsor.findMany() as Promise<Sponsor[]>,
  ]);
  return { settings, donations, sponsors };
};

const TokoPage: FC = async () => {
  const { settings, donations, sponsors } = await fetchData();

  if (settings && settings.isActive === false) {
    return <MaintenanceNotice />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Toko &amp; <span className="text-indigo-600">Dukungan</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg">
            Dukung kelangsungan web dan penulis dengan berdonasi atau membeli produk/merchandise resmi.
          </p>
        </div>
        <div className="space-y-16">
          <DonationSection donations={donations} />
          <SponsorsSection sponsors={sponsors} />
        </div>
      </div>
    </div>
  );
};

export default TokoPage;