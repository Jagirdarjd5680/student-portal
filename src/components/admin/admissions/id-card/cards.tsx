import { CardField, CardFrame, CardPhoto, RecordStrip } from "./card-parts";
import type { IdCardData } from "./utils";

interface CardProps {
  d: IdCardData;
}

/** Aadhaar style: white card, saffron/green brush bands, big number at the bottom. */
export function AadhaarCard({ d }: CardProps) {
  return (
    <CardFrame className="bg-white">
      <div className="absolute inset-x-0 top-0 px-4 pt-3">
        <div className="h-2.5 w-3/5 rounded-full bg-orange-400/90" />
        <div className="mt-1 h-2.5 w-2/3 rounded-full bg-green-500/90" />
        <p className="mt-1.5 text-[0.6rem] font-bold tracking-widest text-gray-500 uppercase">
          Aadhaar · Details
        </p>
      </div>
      <div className="absolute inset-x-4 top-[34%] flex gap-3">
        <CardPhoto src={d.photo} className="h-[4.5rem] w-14" />
        <div className="min-w-0 space-y-1">
          <CardField label="Name" value={d.name} strong />
          <CardField label="DOB" value={d.dob} />
          <CardField label="Gender" value={d.gender} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-5 text-center">
        <p className="text-base font-bold tracking-[0.2em]">{d.number}</p>
        <div className="mx-4 mt-1 h-0.5 bg-red-500" />
      </div>
      <RecordStrip />
    </CardFrame>
  );
}

/** PAN style: blue gradient, photo left, number in the middle. */
export function PanCard({ d }: CardProps) {
  return (
    <CardFrame className="bg-gradient-to-br from-sky-200 via-sky-300 to-blue-400">
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-[0.7rem] font-extrabold tracking-wide text-blue-950 uppercase">
          Permanent Account Number
        </p>
        <p className="text-[0.55rem] font-semibold text-blue-900/70 uppercase">
          Details
        </p>
      </div>
      <div className="flex gap-3 px-4 pt-2">
        <CardPhoto src={d.photo} className="h-[4.5rem] w-14" />
        <div className="min-w-0 flex-1 space-y-1 text-blue-950">
          <p className="text-sm font-bold tracking-widest">{d.number}</p>
          <CardField label="Name" value={d.name} strong />
          <CardField label="Father's Name" value={d.father} />
          <CardField label="Date of Birth" value={d.dob} />
        </div>
      </div>
      <RecordStrip className="bg-blue-950/80" />
    </CardFrame>
  );
}

/** Driving licence style: cream card, red header band, chip, photo right. */
export function DrivingLicenseCard({ d }: CardProps) {
  return (
    <CardFrame className="bg-amber-50">
      <div className="bg-red-800 px-4 py-1.5 text-center text-white">
        <p className="text-[0.7rem] font-extrabold tracking-wider uppercase">
          Driving Licence · Details
        </p>
      </div>
      <div className="flex gap-3 px-4 pt-2">
        <div className="mt-1 h-8 w-10 shrink-0 rounded-md bg-gradient-to-br from-yellow-300 to-amber-500 ring-1 ring-amber-600/40" />
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-0.5">
          <CardField label="DL No" value={d.number} strong />
          <CardField label="Name" value={d.name} />
          <CardField label="S/D/W of" value={d.father} />
          <CardField label="DOB" value={d.dob} />
          <CardField label="Address" value={`${d.address} · ${d.pin}`} />
        </div>
        <CardPhoto src={d.photo} className="h-20 w-16 bg-sky-200" />
      </div>
      <RecordStrip className="bg-red-900/85" />
    </CardFrame>
  );
}

/** Voter card style: pale lilac with an orange wave, photo left. */
export function VoterIdCard({ d }: CardProps) {
  return (
    <CardFrame className="bg-gradient-to-br from-violet-50 via-white to-orange-50">
      <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-orange-200/70" />
      <div className="relative px-4 pt-3">
        <p className="text-[0.7rem] font-extrabold tracking-wide text-gray-800 uppercase">
          Elector Photo Identity · Details
        </p>
        <p className="mt-1 text-sm font-bold tracking-widest text-violet-900">
          {d.number}
        </p>
      </div>
      <div className="relative flex gap-3 px-4 pt-1.5">
        <CardPhoto src={d.photo} className="h-[4.5rem] w-14" />
        <div className="min-w-0 space-y-0.5">
          <CardField label="Name" value={d.name} strong />
          <CardField label="Father's Name" value={d.father} />
          <CardField label="Gender" value={d.gender} />
          <CardField label="DOB" value={d.dob} />
        </div>
      </div>
      <RecordStrip className="bg-violet-950/75" />
    </CardFrame>
  );
}

/** Passport style: navy data page with a large photo and a ghost photo. */
export function PassportCard({ d }: CardProps) {
  return (
    <CardFrame className="bg-gradient-to-br from-slate-50 to-sky-100">
      <div className="flex items-center justify-between px-4 pt-2.5">
        <p className="text-[0.65rem] font-extrabold tracking-widest text-blue-950 uppercase">
          Passport · Details
        </p>
        <p className="text-sm font-bold tracking-widest text-blue-950">
          {d.number}
        </p>
      </div>
      <div className="flex gap-3 px-4 pt-2">
        <CardPhoto src={d.photo} className="h-24 w-20" />
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-1 text-blue-950">
          <CardField
            className="col-span-2"
            label="Name"
            value={d.name}
            strong
          />
          <CardField label="Date of Birth" value={d.dob} />
          <CardField label="Sex" value={d.gender.slice(0, 1) || "-"} />
          <CardField className="col-span-2" label="Address" value={d.address} />
          <CardField label="Recorded" value={d.issued} />
        </div>
        <CardPhoto
          src={d.photo}
          className="mt-4 hidden h-16 w-12 opacity-20 sm:flex"
        />
      </div>
      <RecordStrip className="bg-blue-950/85" />
    </CardFrame>
  );
}

/** Fallback when the type is unknown. */
export function GenericIdCard({ d }: CardProps) {
  return (
    <CardFrame className="bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="px-4 pt-3">
        <p className="text-[0.7rem] font-extrabold tracking-wide text-gray-700 uppercase">
          {d.type || "Identity Proof"} · Details
        </p>
        <p className="mt-1 text-sm font-bold tracking-widest">{d.number}</p>
      </div>
      <div className="flex gap-3 px-4 pt-2">
        <CardPhoto src={d.photo} className="h-[4.5rem] w-14" />
        <div className="min-w-0 space-y-0.5">
          <CardField label="Name" value={d.name} strong />
          <CardField label="Father's Name" value={d.father} />
          <CardField label="DOB" value={d.dob} />
        </div>
      </div>
      <RecordStrip />
    </CardFrame>
  );
}
