<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">

<head>
    @include('partials.head')
</head>

<body class="min-h-screen bg-white antialiased dark:bg-linear-to-b dark:from-neutral-950 dark:to-neutral-900">
    <div class="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-[60%_40%] lg:px-0">
        <div class="bg-muted relative hidden h-full flex-col overflow-hidden p-10 text-white lg:flex dark:border-e dark:border-neutral-800">
            {{-- Background video --}}
            <video
                class="absolute inset-0 z-0 h-full w-full object-cover"
                autoplay
                muted
                loop
                playsinline
                preload="auto">
                <source src="{{ asset('assets/background_video.mp4') }}" type="video/mp4">
            </video>

            {{-- Dark overlay for text readability --}}
            <div class="absolute inset-0 z-10 bg-neutral-900/60"></div>

            <a href="{{ route('home') }}" class="relative z-20 flex items-center text-lg font-medium" wire:navigate>
                <span class="flex h-10 w-10 items-center justify-center rounded-md">
                    <x-app-logo-icon class="me-2 h-7 fill-current text-white" />
                </span>
                {{ config('app.name', 'EzraCare') }}
            </a>

            @php
            [$message, $author] = str(Illuminate\Foundation\Inspiring::quotes()->random())->explode('-');
            @endphp

            <div class="relative z-20 mt-auto">
                <blockquote class="space-y-2">
                    <flux:heading size="lg" class="text-white!">&ldquo;{{ trim($message) }}&rdquo;</flux:heading>
                    <footer>
                        <flux:heading class="text-white!">{{ trim($author) }}</flux:heading>
                    </footer>
                </blockquote>
            </div>

        </div>

        <div class="w-full lg:p-8">
            <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <a href="{{ route('home') }}" class="z-20 flex flex-col items-center gap-2 font-medium lg:hidden" wire:navigate>
                    <span class="flex h-9 w-9 items-center justify-center rounded-md">
                        <x-app-logo-icon class="size-9 fill-current text-black dark:text-white" />
                    </span>

                    <span class="sr-only">{{ config('app.name', 'EzraCare') }}</span>
                </a>
                {{ $slot }}
            </div>
        </div>
    </div>

    @persist('toast')
    <flux:toast.group>
        <flux:toast />
    </flux:toast.group>
    @endpersist

    @fluxScripts
</body>

</html>