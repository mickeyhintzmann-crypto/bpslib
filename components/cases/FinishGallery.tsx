import { finishGallery } from "@/lib/finish-gallery-data";
import { isLocalImageAvailable } from "@/lib/image-utils";

import { FinishGalleryClient } from "./FinishGalleryClient";

export const FinishGallery = () => {
  const items = finishGallery.filter((item) => isLocalImageAvailable(item.image));
  return <FinishGalleryClient items={items} />;
};
