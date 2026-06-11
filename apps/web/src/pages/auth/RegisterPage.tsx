import Slider from "../../components/auth/slider";
import { Suspense } from "react";
import { RegisterForm } from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <div className="flex h-screen w-full justify-center overflow-x-hidden bg-white">
        <div className="md:flex md:h-full md:w-full md:space-x-14">
          <div className="hidden bg-gradient-to-br from-[#19275A] via-[#19275A] to-[#19275A] md:flex md:h-full md:w-1/2">
            <Slider />
          </div>
          <div className="flex h-full w-full items-center justify-center md:w-1/2">
            <div className="w-full">
              <Suspense>
                <RegisterForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
