const Slider = () => {
  return (
    <div className="flex h-full w-full items-center justify-center px-6 lg:px-12">
      <div className="flex w-full max-w-2xl flex-col items-center">
        <div className="relative mx-auto w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] xl:w-[600px]">
          <div
            className="
              absolute -z-10
              -top-10 -left-10
              w-[115%] h-[115%]
              bg-[#f3ece7]
              rounded-[45%_55%_25%_75%/65%_35%_65%_35%]
              -rotate-6
            "
          />
          <img
            src="/techkraft_intro-hero_screenshot.jpg"
            alt="Illustration"
            className="
              w-full h-auto object-cover
              rounded-[85%_15%_75%_15%/80%_25%_5%_70%]
            "
          />
        </div>

        <div className="mt-6 max-w-md text-center text-white lg:mt-8">
          <h2 className="font-poppins text-2xl font-bold sm:text-3xl lg:text-4xl text-white">
            Build Operate Transfer
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base lg:text-lg">
            High-Performance Engineering. Not Just Extra Hands.
          </p>

          <div className="mt-6 flex justify-center gap-2 lg:mt-8">
            <div className="h-2 w-8 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
