import fetch from "node-fetch";

export interface IPhaseAndCurrent {
    phase: number;
    current: number;
}

export class GoEApi {
    private serialNr = "";
    private apiToken = "";

    constructor(serialNr: string, apiToken: string) {
        this.serialNr = serialNr;
        this.apiToken = apiToken;
    }

    async getStatus(): Promise<any> {
        const endpoint = this.getEndpoint() + "/api/status";
        const response = await fetch(endpoint, {...this.getHeader()});
        return await response.json();
    }

    async setChargingSpeed(currentKw: number, targetKw: number) {
        if (targetKw === 0 && currentKw === 0) 
            return await this.setRawChargingSpeed(0, 0);

        const diffLimit = 0.3;
        const diff = Math.abs(currentKw - targetKw);
        if (diff < diffLimit) 
            return;

        const phaseAndCurrent = this.getPhaseAndCurrent(targetKw);
        return await this.setRawChargingSpeed(phaseAndCurrent.current, phaseAndCurrent.phase);
    }

    getPhaseAndCurrent(kw: number): IPhaseAndCurrent {
        let phase = 1;
        let current: number; // Minimum current setting

        // Assuming a voltage of 230V for single-phase and 400V for three-phase
        const singlePhaseVoltage = 230;
        const threePhaseVoltage = 400;

        // Calculate the current for single-phase
        const singlePhaseCurrent = (kw * 1000) / singlePhaseVoltage;

        // If the current exceeds 16A (common limit for single-phase), switch to three-phase
        if (singlePhaseCurrent > 16) {
            phase = 3;
            current = (kw * 1000) / (threePhaseVoltage * Math.sqrt(3));
        } else {
            current = singlePhaseCurrent;
        }

        // Round the current to the nearest whole number
        current = Math.round(current);

        // Ensure current is within safe and valid range
        if (phase === 1 && current > 32) {
            current = 32; // Upper limit for single-phase
        } else if (phase === 3 && current > 32) {
            current = 32; // Upper limit for three-phase
        } else if (current < 6) {
            current = 6; // Lower limit for safety
        }

        return {phase, current};
    }

    private getEndpoint() {
        const url = process.env.NEXT_PUBLIC_GOE_URL!;
        return url.replace("snr", this.serialNr);
    }

    private getHeader() {
        return {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiToken}`
            }
        };
    }

    private async setRawChargingSpeed(current: number, phase: number): Promise<any> {
        try {
            phase = phase == 3 ? 2 : phase;
            const charge = current > 0 && phase > 0;
            let endpoint = !charge 
                    ? `${this.getEndpoint()}/api/set?amp=0&frc=0`
                    : `${this.getEndpoint()}/api/set?&amp=${current}&psm=${phase}&frc=2`;
            
            const response = await fetch(endpoint, {
                ...this.getHeader(),
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                return { endpoint, data};
            }
            return {
                endpoint,
                status: response.status,
                statusText: response.statusText
            };
        } catch (e) {
            return e;
        }
    }
}